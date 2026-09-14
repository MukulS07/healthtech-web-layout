import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Hospital } from "@/models/Hospital";
import { seedDatabaseFn } from "./seed";

export interface GetHospitalsParams {
  city?: string;
  query?: string;
}

/**
 * Server function to fetch hospital network listings directly from MongoDB.
 */
export const getHospitalsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetHospitalsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      // Ensure DB has seed data if empty
      const hospitalCount = await Hospital.countDocuments();
      if (hospitalCount === 0) {
        await seedDatabaseFn();
      }

      const filter: Record<string, unknown> = {};

      if (data?.city && data.city !== "All Cities") {
        filter["city"] = data.city;
      }

      if (data?.query) {
        const regex = new RegExp(data.query, "i");
        filter["$or"] = [{ name: regex }, { city: regex }, { address: regex }];
      }

      const docs = await Hospital.find(filter).sort({ createdAt: -1 }).lean();

      return {
        success: true,
        count: docs.length,
        hospitals: docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
          city: doc.city,
          rating: doc.rating,
          beds: doc.beds,
          specialties: doc.specialties || [],
          img: doc.img || "",
          address: doc.address || "",
          accreditations: ["NABH", "ISO 9001"],
        })),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        count: 0,
        hospitals: [],
        error: errMessage,
      };
    }
  });
