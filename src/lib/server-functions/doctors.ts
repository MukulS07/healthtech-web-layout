import { createServerFn } from "@tanstack/react-start";
import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { Doctor } from "@/models/Doctor";
import { DoctorSchedule } from "@/models/DoctorSchedule";
// Imported for its side effect (registering the "Hospital" model with Mongoose) — DoctorSchedule's
// populate("hospital") below throws MissingSchemaError without it if this is the first code path in
// the process to touch a doctor/hospital relationship (e.g. a cold Vercel function instance that
// hasn't already served a /hospitals or homepage request).
import "@/models/Hospital";
import { displayCityFor, locationValuesFor } from "@/lib/city-aliases";
import {
  displayRating,
  escapeRegex,
  formatDoctorName,
  formatExperience,
  formatQualification,
  formatSpecialization,
  initialsFor,
} from "@/lib/doctor-format";
import { getSpeciality, NON_PERSON_NAME_PATTERN, SPECIALITIES, SURGICAL_DOCTOR_MATCH } from "@/data/catalog";
import { usableImageUrl } from "@/lib/utils";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export interface GetDoctorsParams {
  city?: string;
  /** A catalog speciality slug (e.g. "proctology"); free text is accepted for back-compat. */
  specialty?: string;
  /** Surgery-type slug, e.g. "c-section" — narrows to doctors who list it in surgeryTypes. */
  treatment?: string;
  query?: string;
  sort?: string;
  limit?: number;
  page?: number;
  /** "all" disables the surgical-speciality whitelist (admin directory management only). */
  scope?: "surgical" | "all";
}

/**
 * Base filter for every public doctor listing: only doctors whose specialization matches a
 * surgical speciality in our catalog (the raw data mixes in dentists, vets, physicians, dietitians
 * and non-person listings like clinics — see CLAUDE.md), and never rows whose "name" is actually
 * an organisation.
 */
function surgicalBaseFilter(): Record<string, unknown> {
  const notOrg = new RegExp(NON_PERSON_NAME_PATTERN, "i");
  return {
    isActive: { $ne: false },
    specialization: { $regex: SURGICAL_DOCTOR_MATCH, $options: "i" },
    firstName: { $not: notOrg },
    lastName: { $not: notOrg },
  };
}

type RawDoctor = {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  slug?: string;
  specialization?: string;
  specializationList?: string[];
  qualification?: string;
  experience?: unknown;
  rating?: { average?: number; count?: number };
  location?: string;
  locality?: string;
  avatar?: string;
  homeVisitFee?: number;
  languages?: string[];
  surgeryTypes?: string[];
  isSurgeon?: boolean;
};

/** Shape every doctor card/profile reads. Ratings are null (hidden) unless real. */
function toDoctorCard(doc: RawDoctor) {
  const name = formatDoctorName(doc.firstName, doc.lastName);
  const rating = displayRating(doc.rating?.average, doc.rating?.count);
  return {
    id: String(doc._id),
    name,
    initials: initialsFor(name),
    slug: doc.slug || "",
    specialty: formatSpecialization(doc.specialization || (doc.specializationList || [])[0]),
    cred: formatQualification(doc.qualification),
    exp: formatExperience(doc.experience),
    rating: rating?.value ?? null,
    reviewCount: rating?.count ?? 0,
    city: doc.location || "",
    locality: doc.locality || "",
    img: usableImageUrl(doc.avatar),
    fees: doc.homeVisitFee || 0,
    languages: doc.languages || [],
    surgeryTypes: doc.surgeryTypes || [],
    isSurgeon: Boolean(doc.isSurgeon),
  };
}

/** First active hospital per doctor, for "where they practise" on cards. One query per page. */
async function primaryHospitals(doctorIds: Types.ObjectId[]) {
  const map = new Map<string, { name: string; slug: string; locality: string }>();
  if (doctorIds.length === 0) return map;
  const schedules = await DoctorSchedule.find({ doctor: { $in: doctorIds }, isActive: { $ne: false } })
    .populate("hospital", "name slug locality city")
    .select("doctor hospital")
    .lean();
  for (const s of schedules) {
    const h = s.hospital as unknown as { name?: string; slug?: string; locality?: string } | null;
    const key = String(s.doctor);
    if (h?.name && !map.has(key)) map.set(key, { name: h.name, slug: h.slug || "", locality: h.locality || "" });
  }
  return map;
}

/**
 * Server function to fetch doctor listings from MongoDB with optional filtering.
 *
 * Queries the real `doctors` collection fields (firstName/lastName, specialization, experience,
 * location, surgeryTypes — see src/models/Doctor.ts) and adapts the output to the field names the
 * frontend reads (name, specialty, cred, exp, city, rating, ...), normalised for display (see
 * src/lib/doctor-format.ts). `limit` is capped at 100 — this collection has 227k+ documents.
 */
export const getDoctorsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetDoctorsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const filter: Record<string, unknown> =
        data?.scope === "all" ? { isActive: { $ne: false } } : surgicalBaseFilter();
      const and: Record<string, unknown>[] = [];

      if (data?.city && data.city !== "All Cities") {
        const locations = locationValuesFor(data.city);
        filter["location"] = locations.length > 1 ? { $in: locations } : locations[0];
      }

      if (data?.specialty && data.specialty !== "All Specialties") {
        const spec = getSpeciality(data.specialty);
        const source = spec ? spec.doctorMatch : escapeRegex(data.specialty);
        and.push({ specialization: { $regex: source, $options: "i" } });
      }

      if (data?.treatment) {
        filter["surgeryTypes"] = data.treatment;
      }

      if (data?.query) {
        const regex = new RegExp(escapeRegex(data.query.trim()), "i");
        and.push({ $or: [{ firstName: regex }, { lastName: regex }, { specialization: regex }, { locality: regex }] });
      }
      if (and.length) filter["$and"] = and;

      let queryBuilder = Doctor.find(filter);

      if (data?.sort === "Experience: High to Low") {
        queryBuilder = queryBuilder.sort({ experience: -1 });
      } else if (data?.sort === "Experience: Low to High") {
        queryBuilder = queryBuilder.sort({ experience: 1 });
      } else if (data?.sort === "Rating: High to Low") {
        queryBuilder = queryBuilder.sort({ "rating.count": -1, "rating.average": -1 });
      } else {
        // "Relevance": doctors with real reviews first, then newest.
        queryBuilder = queryBuilder.sort({ "rating.count": -1, createdAt: -1 });
      }

      const limit = Math.min(Math.max(data?.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);

      const [docs, total] = await Promise.all([
        queryBuilder.select("-password").lean<RawDoctor[]>(),
        Doctor.countDocuments(filter),
      ]);
      const hospitals = await primaryHospitals(docs.map((d) => d._id));

      return {
        success: true,
        count: docs.length,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        doctors: docs.map((doc) => ({ ...toDoctorCard(doc), hospital: hospitals.get(String(doc._id)) ?? null })),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        count: 0,
        total: 0,
        page: 1,
        limit: DEFAULT_LIMIT,
        totalPages: 1,
        doctors: [],
        error: errMessage,
      };
    }
  });

type Facets = {
  specialities: { slug: string; name: string; count: number }[];
  cities: { name: string; count: number }[];
  total: number;
};
let facetCache: { at: number; value: Facets } | null = null;
const FACET_TTL_MS = 60 * 60 * 1000;

/**
 * Real counts behind the /doctors filter dropdowns: surgical doctors per catalog speciality and
 * per city (NCR satellites rolled into "Delhi NCR"). One aggregation over distinct raw values,
 * cached per server instance for an hour.
 */
export const getDoctorFacetsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (facetCache && Date.now() - facetCache.at < FACET_TTL_MS) {
      return { success: true as const, ...facetCache.value };
    }
    await connectToDatabase();
    const base = surgicalBaseFilter();
    const [bySpec, byCity] = await Promise.all([
      Doctor.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $group: { _id: { $toLower: "$specialization" }, n: { $sum: 1 } } },
      ]),
      Doctor.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $group: { _id: "$location", n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 80 },
      ]),
    ]);

    const specialities = SPECIALITIES.map((s) => {
      const re = new RegExp(s.doctorMatch, "i");
      const count = bySpec.reduce((sum, row) => (row._id && re.test(row._id) ? sum + row.n : sum), 0);
      return { slug: s.slug, name: s.name, count };
    }).filter((s) => s.count > 0);

    const cityTotals = new Map<string, number>();
    for (const row of byCity) {
      if (!row._id) continue;
      const display = displayCityFor(row._id);
      cityTotals.set(display, (cityTotals.get(display) || 0) + row.n);
    }
    const cities = [...cityTotals.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);

    const value = { specialities, cities, total: bySpec.reduce((s, r) => s + r.n, 0) };
    facetCache = { at: Date.now(), value };
    return { success: true as const, ...value };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, specialities: [], cities: [], total: 0, error: errMessage };
  }
});

/**
 * Server function to fetch a single doctor by slug from MongoDB, including the hospitals they
 * practice at (via the DoctorSchedule join collection — the real system doesn't keep a hospital
 * list directly on the doctor document).
 */
export const getDoctorBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    try {
      await connectToDatabase();
      const doc = await Doctor.findOne({ slug })
        .select("-password")
        .lean<RawDoctor & { bio?: string; registrationNumber?: string }>();

      if (!doc) {
        return { success: false, error: "Doctor not found" };
      }

      const schedules = await DoctorSchedule.find({ doctor: doc._id, isActive: { $ne: false } })
        .populate("hospital", "name slug city locality address")
        .lean();

      const bio = (doc.bio || "").trim();
      const matched = SPECIALITIES.find((s) => new RegExp(s.doctorMatch, "i").test(doc.specialization || ""));
      return {
        success: true,
        doctor: {
          ...toDoctorCard(doc),
          // A "bio" that's just the doctor's own first name (common in the imported data) isn't a bio.
          bio: bio.length > 40 ? bio : "",
          registrationNumber: doc.registrationNumber || "",
          specialitySlug: matched?.slug ?? null,
          specialityName: matched?.name ?? null,
          hospitals: schedules.map((s) => {
            const h = s.hospital as unknown as {
              _id: unknown;
              name?: string;
              slug?: string;
              city?: string;
              locality?: string;
              address?: string;
            };
            return {
              id: h?._id ? String(h._id) : "",
              name: h?.name || "",
              slug: h?.slug || "",
              city: h?.city || "",
              locality: h?.locality || "",
              address: h?.address || "",
              consultationFee: s.consultationFee || 0,
            };
          }),
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errMessage };
    }
  });

export interface CreateDoctorInput {
  firstName: string;
  lastName: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  location?: string;
  locality?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  homeVisitFee?: number;
  languages?: string[];
  surgeryTypes?: string[];
  registrationNumber?: string;
}

export const createDoctorFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateDoctorInput)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      const base = `${data.firstName} ${data.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const doctor = await Doctor.create({
        ...data,
        slug: `${base}-${Date.now().toString(36)}`,
      });

      return { success: true as const, id: String(doctor._id), message: "Doctor added successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export const updateDoctorFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as UpdateDoctorInput)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      const { id, ...updates } = data;
      const updated = await Doctor.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return { success: false as const, error: "Doctor not found" };

      return { success: true as const, message: "Doctor updated successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export const deleteDoctorFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      await Doctor.findByIdAndDelete(data.id);
      return { success: true as const, message: "Doctor deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
