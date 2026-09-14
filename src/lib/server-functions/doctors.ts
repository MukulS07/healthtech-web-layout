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
