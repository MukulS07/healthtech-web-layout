import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { Hospital } from "@/models/Hospital";
import { DoctorSchedule } from "@/models/DoctorSchedule";
import { Review } from "@/models/Review";
// Imported for its side effect (registering the "Doctor" model with Mongoose) — DoctorSchedule's
// populate("doctor") below throws MissingSchemaError without it if this is the first code path in
// the process to touch a doctor/hospital relationship (e.g. a cold Vercel function instance).
import "@/models/Doctor";
import { locationValuesFor } from "@/lib/city-aliases";
import { usableImageUrl } from "@/lib/utils";
import { displayCityFor } from "@/lib/city-aliases";
import { escapeRegex, formatDoctorName, formatExperience, formatQualification, formatSpecialization } from "@/lib/doctor-format";
import { getSpeciality, SPECIALITIES } from "@/data/catalog";

/**
 * Raw hospital `departments` are free text with near-duplicates ("Nephrologist" vs
 * "Nephrologist/Renal Specialist", "ENT/ Otorhinolaryngologist"). Normalise casing/separators and
 * drop entries that collapse to the same thing.
 */
function tidyDepartments(departments: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of departments) {
    const first = String(raw).split(/[/(]/)[0] ?? "";
    const label = formatSpecialization(first.trim());
    const key = label.toLowerCase().replace(/[^a-z]/g, "");
    if (!label || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export interface GetHospitalsParams {
  city?: string | undefined;
  /** Catalog speciality slug — hospitals whose departments match it. */
  speciality?: string | undefined;
  query?: string | undefined;
  limit?: number | undefined;
  page?: number | undefined;
}

/** Real hospital docs have no rating field of their own — derive one from the ratings of the
 * doctors who actually practice there (via DoctorSchedule → Review), weighted by each doctor's
 * review count. Returns an empty map entry (no key) for hospitals with no reviewed doctors yet,
 * rather than a fabricated flat number. */
async function computeHospitalRatings(
  hospitalIds: mongoose.Types.ObjectId[],
): Promise<Map<string, { average: number; count: number }>> {
  const schedules = await DoctorSchedule.find({ hospital: { $in: hospitalIds } })
    .select("hospital doctor")
    .lean();
  if (schedules.length === 0) return new Map();

  const doctorIds = [...new Set(schedules.map((s) => String(s.doctor)))];
  const doctorAverages = await Review.aggregate<{ _id: string; avg: number; count: number }>([
    { $match: { doctorId: { $in: schedules.map((s) => s.doctor) } } },
    { $group: { _id: "$doctorId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avgByDoctor = new Map(doctorAverages.map((d) => [String(d._id), d]));

  const byHospital = new Map<string, { sum: number; count: number }>();
  for (const s of schedules) {
    const doctorStats = avgByDoctor.get(String(s.doctor));
    if (!doctorStats) continue;
    const hId = String(s.hospital);
    const entry = byHospital.get(hId) || { sum: 0, count: 0 };
    entry.sum += doctorStats.avg * doctorStats.count;
    entry.count += doctorStats.count;
    byHospital.set(hId, entry);
  }

  const result = new Map<string, { average: number; count: number }>();
  for (const [hId, { sum, count }] of byHospital) {
    if (count > 0) result.set(hId, { average: Math.round((sum / count) * 10) / 10, count });
  }
  return result;
}

/**
 * Server function to fetch hospital network listings from MongoDB.
 *
 * Queries the real `hospitals` collection (34k+ documents — see src/models/Hospital.ts) and
 * adapts the output to the field names the existing frontend reads (rating, beds, specialties,
 * accreditations). Real hospital documents don't carry a single rating field or a hardcoded
 * accreditation list — `rating` is now a genuine derived average from the reviews of doctors who
 * practice there (via DoctorSchedule + Review; `null` if none are reviewed yet), and
 * `accreditations` comes through empty rather than fabricated, since no real accreditation data
 * exists for this collection.
 */
export const getHospitalsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetHospitalsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isActive: { $ne: false } };

      if (data?.city && data.city !== "All Cities") {
        const locations = locationValuesFor(data.city);
        filter["city"] = locations.length > 1 ? { $in: locations } : locations[0];
      }

      if (data?.speciality) {
        const spec = getSpeciality(data.speciality);
        if (spec) filter["departments"] = { $regex: spec.doctorMatch, $options: "i" };
      }

      if (data?.query) {
        const regex = new RegExp(escapeRegex(data.query.trim()), "i");
        filter["$or"] = [{ name: regex }, { city: regex }, { address: regex }, { locality: regex }];
      }

      const limit = Math.min(data?.limit || DEFAULT_LIMIT, MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);

      const [docs, total] = await Promise.all([
        Hospital.find(filter)
          .sort({ totalDoctors: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Hospital.countDocuments(filter),
      ]);

      const ratings = await computeHospitalRatings(docs.map((d) => d._id));

      return {
        success: true,
        count: docs.length,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        hospitals: docs.map((doc) => {
          const rating = ratings.get(String(doc._id));
          return {
            id: String(doc._id),
            name: doc.name,
            slug: doc.slug,
            city: doc.city || "",
            locality: doc.locality || "",
            rating: rating ? String(rating.average) : null,
            reviewCount: rating?.count || 0,
            beds: doc.totalBeds || 0,
            totalDoctors: doc.totalDoctors || 0,
            specialties: tidyDepartments(doc.departments || []),
            img: usableImageUrl(doc.coverImage) || usableImageUrl(doc.logo),
            address: doc.address || "",
            accreditations: Array.isArray(doc.accreditations) ? doc.accreditations : [],
          };
        }),
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
        hospitals: [],
        error: errMessage,
      };
    }
  });

/**
 * Server function to fetch a single hospital by slug, including its real doctor roster (via
 * DoctorSchedule) and a derived rating from those doctors' real reviews.
 */
export const getHospitalBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    try {
      await connectToDatabase();
      const hospital = await Hospital.findOne({ slug }).lean();
      if (!hospital) {
        return { success: false as const, error: "Hospital not found" };
      }

      const schedules = await DoctorSchedule.find({ hospital: hospital._id, isActive: { $ne: false } })
        .populate("doctor", "firstName lastName specialization qualification experience avatar slug rating")
        .lean();

      const doctorIds = schedules.map((s) => s.doctor).filter(Boolean);
      const doctorRatings = await Review.aggregate<{ _id: string; avg: number; count: number }>([
        { $match: { doctorId: { $in: doctorIds.map((d) => (d as { _id: unknown })._id) } } },
        { $group: { _id: "$doctorId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      const totalReviewCount = doctorRatings.reduce((sum, d) => sum + d.count, 0);
      const overallAverage =
        totalReviewCount > 0
          ? Math.round(
              (doctorRatings.reduce((sum, d) => sum + d.avg * d.count, 0) / totalReviewCount) * 10,
            ) / 10
          : null;

      return {
        success: true as const,
        hospital: {
          id: String(hospital._id),
          name: hospital.name,
          slug: hospital.slug,
          city: hospital.city || "",
          state: hospital.state || "",
          locality: hospital.locality || "",
          pincode: hospital.pincode || "",
          address: hospital.address || "",
          about: hospital.description || hospital.about || "",
          phone: hospital.phone || "",
          website: hospital.website || "",
          emergency24x7: Boolean(hospital.emergency24x7),
          emergencyContact: hospital.emergencyContact || "",
          departments: tidyDepartments(hospital.departments || []),
          services: (hospital.services || [])
            .map((s: { name?: string }) => s.name)
            .filter((s): s is string => Boolean(s)),
          totalDoctors: hospital.totalDoctors || schedules.length,
          totalBeds: hospital.totalBeds || 0,
          icuBeds: hospital.icuBeds || 0,
          img: usableImageUrl(hospital.coverImage) || usableImageUrl(hospital.logo),
          rating: overallAverage,
          reviewCount: totalReviewCount,
          doctors: schedules
            .map((s) => {
              const d = s.doctor as unknown as {
                _id: unknown;
                firstName?: string;
                lastName?: string;
                specialization?: string;
                qualification?: string;
                experience?: number;
                avatar?: string;
                slug?: string;
              } | null;
              if (!d) return null;
              return {
                id: String(d._id),
                name: formatDoctorName(d.firstName, d.lastName),
                slug: d.slug || "",
                specialty: formatSpecialization(d.specialization),
                qualification: formatQualification(d.qualification),
                experience: formatExperience(d.experience),
                img: usableImageUrl(d.avatar),
                consultationFee: s.consultationFee || 0,
              };
            })
            .filter((d): d is NonNullable<typeof d> => d !== null),
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

let hospitalFacetCache: { at: number; value: { cities: { name: string; count: number }[]; specialities: { slug: string; name: string; count: number }[] } } | null = null;

/** Real counts for the /hospitals city + speciality dropdowns. Cached per instance for an hour. */
export const getHospitalFacetsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (hospitalFacetCache && Date.now() - hospitalFacetCache.at < 60 * 60 * 1000) {
      return { success: true as const, ...hospitalFacetCache.value };
    }
    await connectToDatabase();
    const base = { isActive: { $ne: false } };
    const [byCity, byDept] = await Promise.all([
      Hospital.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $group: { _id: "$city", n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 80 },
      ]),
      Hospital.aggregate<{ _id: string; n: number }>([
        { $match: base },
        { $unwind: "$departments" },
        { $group: { _id: { $toLower: "$departments" }, n: { $sum: 1 } } },
      ]),
    ]);
    const cityTotals = new Map<string, number>();
    for (const row of byCity) {
      if (!row._id) continue;
      const name = displayCityFor(row._id);
      cityTotals.set(name, (cityTotals.get(name) || 0) + row.n);
    }
    const value = {
      cities: [...cityTotals.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 40),
      // Approximate: a hospital with two matching departments counts twice. Used only for ordering/labels.
      specialities: SPECIALITIES.map((sp) => {
        const re = new RegExp(sp.doctorMatch, "i");
        return { slug: sp.slug, name: sp.name, count: byDept.reduce((sum, r) => (r._id && re.test(r._id) ? sum + r.n : sum), 0) };
      }).filter((x) => x.count > 0),
    };
    hospitalFacetCache = { at: Date.now(), value };
    return { success: true as const, ...value };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, cities: [], specialities: [], error: errMessage };
  }
});

export interface CreateHospitalInput {
  name: string;
  city?: string;
  locality?: string;
  totalBeds?: number;
  departments?: string[];
  coverImage?: string;
  address?: string;
  description?: string;
}

export const createHospitalFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateHospitalInput)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const hospital = await Hospital.create({
        ...data,
        slug: `${slug}-${Date.now().toString(36)}`,
      });

      return { success: true as const, id: String(hospital._id), message: "Hospital added successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export interface UpdateHospitalInput extends Partial<CreateHospitalInput> {
  id: string;
}

export const updateHospitalFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as UpdateHospitalInput)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      const { id, ...updates } = data;
      const updated = await Hospital.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return { success: false as const, error: "Hospital not found" };

      return { success: true as const, message: "Hospital updated successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export const deleteHospitalFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();
      await Hospital.findByIdAndDelete(data.id);
      return { success: true as const, message: "Hospital deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
