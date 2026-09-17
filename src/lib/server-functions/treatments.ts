import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Treatment } from "@/models/Treatment";
import { seedDatabaseFn } from "./seed";
import surgeryCatalog from "@/data/surgery-catalog.json";

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
      await ensureFullCatalog();

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

/**
 * Server function to fetch the distinct treatment categories actually present in the
 * catalog, with counts. Used to drive category nav (header pills, /treatments filter
 * chips) from real data instead of a hardcoded, drift-prone list.
 */
export const getTreatmentCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();

    const treatmentCount = await Treatment.countDocuments();
    if (treatmentCount === 0) {
      await seedDatabaseFn();
    }
    await ensureFullCatalog();

    const categories = await Treatment.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      success: true as const,
      categories: categories.map((c) => ({ category: c._id, count: c.count })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, categories: [], error: errMessage };
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function categoryShortSlug(category: string): string {
  return slugify(category).split("-").slice(0, 2).join("-");
}

const CATALOG_PROCEDURE_COUNT = (
  surgeryCatalog as { category: string; procedures: string[] }[]
).reduce((sum, c) => sum + c.procedures.length, 0);

/**
 * Idempotently imports the full surgical catalog (463 procedures across 17 categories, from
 * "Complete List of Surgical Categories and Procedures") into the Treatment collection.
 * Safe to re-run — skips any (name, category) pair already present, so it never overwrites
 * anything an admin has since hand-edited.
 */
async function importSurgeryCatalog() {
  await connectToDatabase();

  const usedSlugs = new Set((await Treatment.find({}, { slug: 1 }).lean()).map((d) => d.slug));

  let inserted = 0;
  let skipped = 0;

  for (const { category, procedures } of surgeryCatalog as {
    category: string;
    procedures: string[];
  }[]) {
    for (const name of procedures) {
      const existing = await Treatment.exists({ name, category });
      if (existing) {
        skipped += 1;
        continue;
      }

      let slug = slugify(name);
      if (usedSlugs.has(slug)) {
        const candidate = `${slug}-${categoryShortSlug(category)}`;
        slug = usedSlugs.has(candidate) ? `${candidate}-${usedSlugs.size}` : candidate;
      }

      await Treatment.create({
        name,
        slug,
        category,
        description: `${name} performed by our specialist surgical team as part of ${category}.`,
        recoveryTime: "Discussed during consultation",
        benefits: ["Specialist-led care", "Discussed during consultation"],
      });
      usedSlugs.add(slug);
      inserted += 1;
    }
  }

  return { inserted, skipped };
}

/**
 * Ensures the full surgical catalog is present, running the import automatically the first
 * time it's needed (e.g. on a fresh/in-memory DB that only has the small default-seed set).
 * Cheap no-op once the collection already has the full catalog.
 */
async function ensureFullCatalog() {
  const treatmentCount = await Treatment.countDocuments();
  if (treatmentCount < CATALOG_PROCEDURE_COUNT) {
    await importSurgeryCatalog();
  }
}

/**
 * Admin-only: manually re-run the catalog import (e.g. after hand-editing procedures so the
 * automatic ensureFullCatalog() top-up no longer covers everything).
 */
export const importSurgeryCatalogFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return { success: false as const, error: "Unauthorized: Admin access required." };
    }

    await connectToDatabase();
    const { inserted, skipped } = await importSurgeryCatalog();

    return {
      success: true as const,
      inserted,
      skipped,
      message: `Imported ${inserted} new procedures (${skipped} already existed).`,
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: errMessage };
  }
});
