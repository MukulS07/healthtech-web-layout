import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Hospital } from "@/models/Hospital";
import { DoctorSchedule } from "@/models/DoctorSchedule";
import { Review } from "@/models/Review";
import { locationValuesFor } from "@/lib/city-aliases";
import { usableImageUrl } from "@/lib/utils";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export interface GetHospitalsParams {
  city?: string;
  query?: string;
  limit?: number;
  page?: number;
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

      if (data?.query) {
        const regex = new RegExp(data.query, "i");
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
            specialties: doc.departments || [],
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
          departments: hospital.departments || [],
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
                name: [d.firstName, d.lastName].filter(Boolean).join(" ").trim() || "Doctor",
                slug: d.slug || "",
                specialty: d.specialization || "",
                qualification: d.qualification || "",
                experience: d.experience || 0,
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
      await connectToDatabase();
      await Hospital.findByIdAndDelete(data.id);
      return { success: true as const, message: "Hospital deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
