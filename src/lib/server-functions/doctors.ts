import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Doctor } from "@/models/Doctor";
import { seedDatabaseFn } from "./seed";

export interface GetDoctorsParams {
  city?: string;
  specialty?: string;
  query?: string;
  sort?: string;
}

/**
 * Server function to fetch doctor listings from MongoDB with optional filtering.
 */
export const getDoctorsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetDoctorsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      // Ensure DB has seed data if empty
      const doctorCount = await Doctor.countDocuments();
      if (doctorCount === 0) {
        await seedDatabaseFn();
      }

      const filter: Record<string, unknown> = {};

      if (data?.city && data.city !== "All Cities") {
        filter["city"] = data.city;
      }

      if (data?.specialty && data.specialty !== "All Specialties") {
        filter["specialty"] = data.specialty;
      }

      if (data?.query) {
        const regex = new RegExp(data.query, "i");
        filter["$or"] = [{ name: regex }, { specialty: regex }, { cred: regex }];
      }

      let queryBuilder = Doctor.find(filter);

      if (data?.sort === "Experience: High to Low") {
        queryBuilder = queryBuilder.sort({ exp: -1 });
      } else if (data?.sort === "Experience: Low to High") {
        queryBuilder = queryBuilder.sort({ exp: 1 });
      } else if (data?.sort === "Rating: High to Low") {
        queryBuilder = queryBuilder.sort({ rating: -1 });
      } else {
        queryBuilder = queryBuilder.sort({ createdAt: -1 });
      }

      const docs = await queryBuilder.lean();

      return {
        success: true,
        count: docs.length,
        doctors: docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
          specialty: doc.specialty,
          cred: doc.cred,
          exp: doc.exp,
          rating: doc.rating,
          city: doc.city,
          img: doc.img || "",
          hospital: doc.hospital || "",
          fees: doc.fees || 0,
        })),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        count: 0,
        doctors: [],
        error: errMessage,
      };
    }
  });

/**
 * Server function to fetch a single doctor by slug from MongoDB.
 */
export const getDoctorBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    try {
      await connectToDatabase();
      const doc = await Doctor.findOne({ slug }).lean();

      if (!doc) {
        return { success: false, error: "Doctor not found" };
      }

      return {
        success: true,
        doctor: {
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
          specialty: doc.specialty,
          cred: doc.cred,
          exp: doc.exp,
          rating: doc.rating,
          city: doc.city,
          img: doc.img || "",
          bio: doc.bio || "",
          fees: doc.fees || 0,
          hospital: doc.hospital || "",
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errMessage };
    }
  });

export interface CreateDoctorInput {
  name: string;
  specialty: string;
  cred: string;
  exp: number;
  rating?: string;
  city: string;
  img?: string;
  bio?: string;
  fees?: number;
  hospital?: string;
}

export const createDoctorFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateDoctorInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const doctor = await Doctor.create({
        ...data,
        slug: `${slug}-${Date.now().toString(36)}`,
        rating: data.rating || "4.8",
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
