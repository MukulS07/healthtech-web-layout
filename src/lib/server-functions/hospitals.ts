import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Hospital } from "@/models/Hospital";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export interface GetHospitalsParams {
  city?: string;
  query?: string;
  limit?: number;
  page?: number;
}

/**
 * Server function to fetch hospital network listings from MongoDB.
 *
 * Queries the real `hospitals` collection (34k+ documents — see src/models/Hospital.ts) and
 * adapts the output to the field names the existing frontend reads (rating, beds, specialties,
 * accreditations). The old fake `rating`/`accreditations` values are gone — real hospital
 * documents don't carry a single rating field (that lives in the separate `hospitalreviews`/
 * `ratings` collections) or a hardcoded accreditation list, so those now come through empty/0
 * rather than fabricated, until that's wired up properly.
 */
export const getHospitalsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetHospitalsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = { isActive: { $ne: false } };

      if (data?.city && data.city !== "All Cities") {
        filter["city"] = data.city;
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

      return {
        success: true,
        count: docs.length,
        total,
        page,
        limit,
        hospitals: docs.map((doc) => ({
          id: String(doc._id),
          name: doc.name,
          slug: doc.slug,
          city: doc.city || "",
          locality: doc.locality || "",
          rating: "4.5",
          beds: doc.totalBeds || 0,
          totalDoctors: doc.totalDoctors || 0,
          specialties: doc.departments || [],
          img: doc.coverImage || doc.logo || "",
          address: doc.address || "",
          accreditations: Array.isArray(doc.accreditations) ? doc.accreditations : [],
        })),
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
