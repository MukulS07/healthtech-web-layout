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

export interface CreateTreatmentInput {
  name: string;
  category: string;
  description: string;
  recoveryTime?: string;
  benefits?: string[];
}

export const createTreatmentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as CreateTreatmentInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

      const treatment = await Treatment.create({
        ...data,
        slug: `${slug}-${Date.now().toString(36)}`,
      });

      return { success: true as const, id: String(treatment._id), message: "Treatment added successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export interface UpdateTreatmentInput extends Partial<CreateTreatmentInput> {
  id: string;
}

export const updateTreatmentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as UpdateTreatmentInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      const { id, ...updates } = data;
      const updated = await Treatment.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) return { success: false as const, error: "Treatment not found" };

      return { success: true as const, message: "Treatment updated successfully!" };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export const deleteTreatmentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();
      await Treatment.findByIdAndDelete(data.id);
      return { success: true as const, message: "Treatment deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
