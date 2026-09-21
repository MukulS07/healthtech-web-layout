import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { serverError } from "@/lib/server-error";
import { Doctor } from "@/models/Doctor";
import { DoctorRanking, MAX_PINNED_DOCTORS } from "@/models/DoctorRanking";
import { clearRankingCache } from "@/lib/rankings";
import { locationValuesFor } from "@/lib/city-aliases";
import { getSpeciality } from "@/data/catalog";
import {
  displayRating,
  escapeRegex,
  formatDoctorName,
  formatExperience,
  formatQualification,
  formatSpecialization,
} from "@/lib/doctor-format";

export { MAX_PINNED_DOCTORS };

type RankedDoctor = {
  id: string;
  name: string;
  slug: string;
  specialty: string;
  cred: string;
  exp: number | null;
  city: string;
  locality: string;
  rating: string | null;
  reviewCount: number;
};

function toRanked(doc: Record<string, unknown>): RankedDoctor {
  const rating = displayRating(
    (doc["rating"] as { average?: number } | undefined)?.average,
    (doc["rating"] as { count?: number } | undefined)?.count,
  );
  return {
    id: String(doc["_id"]),
    name: formatDoctorName(doc["firstName"] as string, doc["lastName"] as string),
    slug: (doc["slug"] as string) || "",
    specialty: formatSpecialization((doc["specialization"] as string) || ""),
    cred: formatQualification(doc["qualification"] as string),
    exp: formatExperience(doc["experience"]),
    city: (doc["location"] as string) || "",
    locality: (doc["locality"] as string) || "",
    rating: rating?.value ?? null,
    reviewCount: rating?.count ?? 0,
  };
}

const SELECT = "firstName lastName slug specialization qualification experience location locality rating";

/**
 * The current pin list for a speciality + city, plus candidates to add.
 *
 * Candidates are restricted to doctors who actually match that speciality and city — pinning a
 * dermatologist to "Cardiac surgery in Pune" would put them at the top of a list they don't
 * belong on, so the editor never offers it.
 */
export const getRankingFn = createServerFn({ method: "GET" })
  .validator((data: { speciality: string; city: string; query?: string }) => data)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const spec = getSpeciality(String(data?.speciality || ""));
      const city = String(data?.city || "").trim();
      if (!spec || !city) return { success: false as const, error: "Choose a speciality and a city." };

      const locations = locationValuesFor(city);
      const filter: Record<string, unknown> = {
        isActive: { $ne: false },
        specialization: { $regex: spec.doctorMatch, $options: "i" },
        location: locations.length > 1 ? { $in: locations } : locations[0],
      };

      const query = String(data?.query || "").trim();
      if (query) {
        const re = new RegExp(escapeRegex(query), "i");
        filter["$or"] = [{ firstName: re }, { lastName: re }, { locality: re }];
      }

      const ranking = await DoctorRanking.findOne({ speciality: spec.slug, city }).lean();
      const pinnedIds = (ranking?.doctorIds ?? []).map((id) => String(id));

      const [pinnedDocs, candidateDocs, total] = await Promise.all([
        pinnedIds.length
          ? Doctor.find({ _id: { $in: pinnedIds.map((id) => new mongoose.Types.ObjectId(id)) } })
              .select(SELECT)
              .lean()
          : Promise.resolve([]),
        Doctor.find({ ...filter, _id: { $nin: pinnedIds.map((id) => new mongoose.Types.ObjectId(id)) } })
          .sort({ "rating.count": -1, experience: -1 })
          .limit(40)
          .select(SELECT)
          .lean(),
        Doctor.countDocuments(filter),
      ]);

      // Preserve the admin's order, which a find({$in}) does not.
      const byId = new Map(pinnedDocs.map((d) => [String(d._id), d]));
      const pinned = pinnedIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map((d) => toRanked(d as unknown as Record<string, unknown>));

      return {
        success: true as const,
        speciality: spec.slug,
        specialityName: spec.name,
        city,
        pinned,
        // A pinned doctor who has since left the directory: shown so it can be cleared.
        missingPins: pinnedIds.filter((id) => !byId.has(id)).length,
        candidates: candidateDocs.map((d) => toRanked(d as unknown as Record<string, unknown>)),
        matchingDoctors: total,
        max: MAX_PINNED_DOCTORS,
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getRanking", error) };
    }
  });

/** Replaces the pin list for one speciality + city. An empty list clears it. */
export const saveRankingFn = createServerFn({ method: "POST" })
  .validator((data: { speciality: string; city: string; doctorIds: string[] }) => data)
  .handler(async ({ data }) => {
    try {
      const admin = await requireAdminUser();
      await connectToDatabase();

      const spec = getSpeciality(String(data?.speciality || ""));
      const city = String(data?.city || "").trim();
      if (!spec || !city) return { success: false as const, error: "Choose a speciality and a city." };

      const ids = Array.from(new Set((data?.doctorIds ?? []).map(String)))
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .slice(0, MAX_PINNED_DOCTORS)
        .map((id) => new mongoose.Types.ObjectId(id));

      await DoctorRanking.findOneAndUpdate(
        { speciality: spec.slug, city },
        { speciality: spec.slug, city, doctorIds: ids, updatedByAdminId: admin._id },
        { upsert: true, new: true },
      );
      clearRankingCache(spec.slug, city);

      return { success: true as const, count: ids.length };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("saveRanking", error) };
    }
  });

/** Every speciality + city that currently has pins, for the "already set up" list. */
export const getRankedCombinationsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await requireAdminUser();
    await connectToDatabase();
    const docs = await DoctorRanking.find({ "doctorIds.0": { $exists: true } })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return {
      success: true as const,
      combinations: docs.map((d) => ({
        speciality: d.speciality,
        specialityName: getSpeciality(d.speciality)?.name ?? d.speciality,
        city: d.city,
        count: d.doctorIds?.length ?? 0,
        updatedAt: new Date(d.updatedAt).toISOString(),
      })),
    };
  } catch (error: unknown) {
    return { success: false as const, error: serverError("getRankedCombinations", error) };
  }
});
