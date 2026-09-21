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
import { serverError } from "@/lib/server-error";
import { pinnedDoctorIds } from "@/lib/rankings";

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
const SPEC_VALUES_TTL_MS = 60 * 60 * 1000;
let specValuesCache: { at: number; values: string[] } | null = null;

/**
 * The exact raw `specialization` strings that match the surgical whitelist (~700 values), cached
 * per instance. Filtering with `$in` on these uses the specialization index; running the big
 * whitelist regex on every request scanned all 227k documents (~4–5 s per listing).
 */
async function surgicalSpecValues(): Promise<string[]> {
  if (specValuesCache && Date.now() - specValuesCache.at < SPEC_VALUES_TTL_MS) return specValuesCache.values;
  const values = (await Doctor.distinct("specialization", {
    specialization: { $regex: SURGICAL_DOCTOR_MATCH, $options: "i" },
  })) as string[];
  specValuesCache = { at: Date.now(), values: values.filter(Boolean) };
  return specValuesCache.values;
}

/** Raw specialization values belonging to one catalog speciality. */
async function specValuesFor(slug: string): Promise<string[] | null> {
  const spec = getSpeciality(slug);
  if (!spec) return null;
  const re = new RegExp(spec.doctorMatch, "i");
  return (await surgicalSpecValues()).filter((v) => re.test(v));
}

async function surgicalBaseFilter(): Promise<Record<string, unknown>> {
  const notOrg = new RegExp(NON_PERSON_NAME_PATTERN, "i");
  return {
    isActive: { $ne: false },
    specialization: { $in: await surgicalSpecValues() },
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
        data?.scope === "all" ? { isActive: { $ne: false } } : await surgicalBaseFilter();
      const and: Record<string, unknown>[] = [];

      if (data?.city && data.city !== "All Cities") {
        const locations = locationValuesFor(data.city);
        filter["location"] = locations.length > 1 ? { $in: locations } : locations[0];
      }

      if (data?.specialty && data.specialty !== "All Specialties") {
        const values = await specValuesFor(data.specialty);
        and.push(
          values
            ? { specialization: { $in: values } }
            : { specialization: { $regex: escapeRegex(data.specialty), $options: "i" } },
        );
      }

      if (data?.treatment) {
        filter["surgeryTypes"] = data.treatment;
      }

      if (data?.query) {
        const regex = new RegExp(escapeRegex(data.query.trim()), "i");
        and.push({ $or: [{ firstName: regex }, { lastName: regex }, { specialization: regex }, { locality: regex }] });
      }
      if (and.length) filter["$and"] = and;

      let sortSpec: Record<string, 1 | -1>;
      if (data?.sort === "Experience: High to Low") {
        sortSpec = { experience: -1 };
      } else if (data?.sort === "Experience: Low to High") {
        sortSpec = { experience: 1 };
      } else if (data?.sort === "Rating: High to Low") {
        // Actually sorts by score now. It used to share the "Relevance" branch below, so choosing
        // it returned the identical order and the option looked broken. Review count breaks ties
        // so a lone 5-star rating doesn't outrank a well-reviewed 4.8.
        sortSpec = { "rating.average": -1, "rating.count": -1 };
      } else {
        // "Relevance": most-reviewed first, then newest — served by the
        // { "rating.count": -1, createdAt: -1 } index on Doctor.
        sortSpec = { "rating.count": -1, createdAt: -1 };
      }

      const limit = Math.min(Math.max(data?.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);

      // Editorially pinned surgeons (admin → Specialisation rankings) lead the first page of a
      // speciality-in-a-city listing. They still have to satisfy the same filter as everyone else,
      // so a pin can never smuggle a non-surgical or wrong-city doctor into the list.
      //
      // Pins are resolved on EVERY page, not just the first, because they have to be excluded from
      // the paged query throughout: excluding them only on page 1 shifts every later page's offset
      // against a list that still contains them, which both repeats the pinned doctors further down
      // and skips however many others got displaced. The skip is then pulled back by the number of
      // pins so page 2 resumes exactly where page 1 stopped.
      const pins =
        data?.specialty && data?.city && data.city !== "All Cities"
          ? await pinnedDoctorIds(data.specialty, data.city)
          : [];
      const pinnedDocs = pins.length
        ? await Doctor.find({ ...filter, _id: { $in: pins } })
            .select("-password")
            .lean<RawDoctor[]>()
        : [];
      // find() ignores the order of $in, so restore the order the admin set.
      const pinnedById = new Map(pinnedDocs.map((d) => [String(d._id), d]));
      const orderedPins = pins.map((id) => pinnedById.get(id)).filter(Boolean) as RawDoctor[];
      const shownPins = page === 1 ? orderedPins : [];

      const listFilter = orderedPins.length
        ? { ...filter, _id: { $nin: orderedPins.map((d) => d._id) } }
        : filter;
      const queryBuilder = Doctor.find(listFilter)
        .sort(sortSpec)
        .skip(Math.max((page - 1) * limit - orderedPins.length, 0))
        .limit(Math.max(limit - shownPins.length, 0));

      const [rest, total] = await Promise.all([
        // allowDiskUse so a deep page can't abort with "Sort exceeded memory limit of 33554432
        // bytes" if one of the sort indexes is missing or still building — that is exactly how the
        // hospital directory broke past page ~130.
        queryBuilder.allowDiskUse(true).select("-password").lean<RawDoctor[]>(),
        Doctor.countDocuments(filter),
      ]);
      const docs = [...shownPins, ...rest];
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
      const errMessage = serverError("doctors", error);
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
  /** Cities with at least 10 listed surgeons (uncapped — `cities` is trimmed for the dropdown). */
  cityCount: number;
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
    const base = await surgicalBaseFilter();
    const [bySpec, byCity] = await Promise.all([
      Doctor.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $group: { _id: { $toLower: "$specialization" }, n: { $sum: 1 } } },
      ]),
      Doctor.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $group: { _id: "$location", n: { $sum: 1 } } },
        { $sort: { n: -1 } },
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
    const allCities = [...cityTotals.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const cities = allCities.slice(0, 40);
    const cityCount = allCities.filter((c) => c.count >= 10).length;

    const value = { specialities, cities, cityCount, total: bySpec.reduce((s, r) => s + r.n, 0) };
    facetCache = { at: Date.now(), value };
    return { success: true as const, ...value };
  } catch (error: unknown) {
    const errMessage = serverError("doctors", error);
    return { success: false as const, specialities: [], cities: [], cityCount: 0, total: 0, error: errMessage };
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
      const errMessage = serverError("doctors", error);
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
      const errMessage = serverError("doctors", error);
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
      const errMessage = serverError("doctors", error);
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
      const errMessage = serverError("doctors", error);
      return { success: false as const, error: errMessage };
    }
  });
