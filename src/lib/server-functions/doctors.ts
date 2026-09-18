import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Doctor } from "@/models/Doctor";
import { DoctorSchedule } from "@/models/DoctorSchedule";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export interface GetDoctorsParams {
  city?: string;
  specialty?: string;
  /** Surgery-type slug, e.g. "c-section" — narrows to doctors who list it in surgeryTypes. */
  treatment?: string;
  query?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

function doctorDisplayName(doc: { firstName?: string; lastName?: string }): string {
  return [doc.firstName, doc.lastName].filter(Boolean).join(" ").trim() || "Doctor";
}

/**
 * Server function to fetch doctor listings from MongoDB with optional filtering.
 *
 * Queries the real `doctors` collection fields (firstName/lastName, specialization, experience,
 * location, surgeryTypes — see src/models/Doctor.ts) and adapts the output to the field names the
 * existing frontend already reads (name, specialty, cred, exp, city, rating, ...), so route
 * components don't need to change. `limit` is capped at 100 — this collection has 227k+ documents,
 * so an unbounded query would try to return all of them.
 */
export const getDoctorsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetDoctorsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isActive: { $ne: false } };

      if (data?.city && data.city !== "All Cities") {
        filter["location"] = data.city;
      }

      if (data?.specialty && data.specialty !== "All Specialties") {
        const regex = new RegExp(data.specialty, "i");
        filter["$or"] = [{ specialization: regex }, { specializationList: regex }];
      }

      if (data?.treatment) {
        filter["surgeryTypes"] = data.treatment;
      }

      if (data?.query) {
        const regex = new RegExp(data.query, "i");
        const textOr = [{ firstName: regex }, { lastName: regex }, { specialization: regex }];
        filter["$and"] = [{ $or: textOr }];
      }

      let queryBuilder = Doctor.find(filter);

      if (data?.sort === "Experience: High to Low") {
        queryBuilder = queryBuilder.sort({ experience: -1 });
      } else if (data?.sort === "Experience: Low to High") {
        queryBuilder = queryBuilder.sort({ experience: 1 });
      } else if (data?.sort === "Rating: High to Low") {
        queryBuilder = queryBuilder.sort({ "rating.average": -1 });
      } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      }

      const limit = Math.min(data?.limit || DEFAULT_LIMIT, MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);

      const [docs, total] = await Promise.all([
        queryBuilder.select("-password").lean(),
        Doctor.countDocuments(filter),
      ]);

      return {
        success: true,
        count: docs.length,
        total,
        page,
        limit,
        doctors: docs.map((doc) => ({
          id: String(doc._id),
          name: doctorDisplayName(doc),
          slug: doc.slug,
          specialty: doc.specialization || (doc.specializationList || []).join(", "),
          cred: doc.qualification || "",
          exp: doc.experience || 0,
          rating: String(doc.rating?.average ?? 0),
          city: doc.location || "",
          locality: doc.locality || "",
          img: doc.avatar || "",
          fees: doc.homeVisitFee || 0,
          languages: doc.languages || [],
          surgeryTypes: doc.surgeryTypes || [],
          isSurgeon: Boolean(doc.isSurgeon),
        })),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        count: 0,
        total: 0,
        doctors: [],
        error: errMessage,
      };
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
      const doc = await Doctor.findOne({ slug }).select("-password").lean();

      if (!doc) {
        return { success: false, error: "Doctor not found" };
      }

      const schedules = await DoctorSchedule.find({ doctor: doc._id, isActive: { $ne: false } })
        .populate("hospital", "name slug city locality address")
        .lean();

      return {
        success: true,
        doctor: {
          id: String(doc._id),
          name: doctorDisplayName(doc),
          slug: doc.slug,
          specialty: doc.specialization || (doc.specializationList || []).join(", "),
          cred: doc.qualification || "",
          exp: doc.experience || 0,
          rating: String(doc.rating?.average ?? 0),
          city: doc.location || "",
          locality: doc.locality || "",
          img: doc.avatar || "",
          bio: doc.bio || "",
          fees: doc.homeVisitFee || 0,
          languages: doc.languages || [],
          registrationNumber: doc.registrationNumber || "",
          surgeryTypes: doc.surgeryTypes || [],
          isSurgeon: Boolean(doc.isSurgeon),
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
      await connectToDatabase();
      await Doctor.findByIdAndDelete(data.id);
      return { success: true as const, message: "Doctor deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
