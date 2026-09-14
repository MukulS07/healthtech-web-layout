import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Treatment } from "@/models/Treatment";
import { seedDatabaseFn } from "./seed";

export interface GetTreatmentsParams {
  category?: string;
  query?: string;
}

/**
 * Server function to fetch medical treatments catalog directly from MongoDB.
 */
export const getTreatmentsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetTreatmentsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      // Ensure DB has seed data if empty
      const treatmentCount = await Treatment.countDocuments();
      if (treatmentCount === 0) {
        await seedDatabaseFn();
      }

      const filter: Record<string, unknown> = {};

      if (data?.category && data.category !== "All Categories") {
        filter["category"] = data.category;
      }

      if (data?.query) {
        const regex = new RegExp(data.query, "i");
        filter["$or"] = [{ name: regex }, { category: regex }, { description: regex }];
      }

      const docs = await Treatment.find(filter).sort({ createdAt: -1 }).lean();

      return {
        success: true,
        count: docs.length,
        treatments: docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
          category: doc.category,
          description: doc.description,
          recoveryTime: doc.recoveryTime || "1-2 Days",
          benefits: doc.benefits || ["Minimally Invasive", "Same Day Discharge"],
        })),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        count: 0,
        treatments: [],
        error: errMessage,
      };
    }
  });
