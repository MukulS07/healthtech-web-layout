import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Hospital } from "@/models/Hospital";
import { Review } from "@/models/Review";
import { getDoctorFacetsFn } from "./doctors";
import { serverError } from "@/lib/server-error";

export interface SiteStats {
  surgeons: number;
  hospitals: number;
  cities: number;
  reviews: number;
  averageRating: number | null;
}

let cache: { at: number; value: SiteStats } | null = null;
const TTL_MS = 60 * 60 * 1000;

/**
 * Real, provable numbers for trust badges and the stats strip — replacing the figures that had
 * been copied from a competitor's site ("2M+ lives", "800+ hospitals", "4.8/5"). Every value is a
 * count of records in our own directory, and the UI labels them as such ("in our directory"),
 * never as "patients treated" or "partner hospitals". Cached per instance for an hour.
 */
export const getSiteStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    if (cache && Date.now() - cache.at < TTL_MS) return { success: true as const, ...cache.value };
    await connectToDatabase();
    const [facets, hospitals, reviewAgg] = await Promise.all([
      getDoctorFacetsFn(),
      Hospital.countDocuments({ isActive: { $ne: false } }),
      Review.aggregate<{ avg: number; n: number }>([
        { $match: { status: { $nin: ["pending", "rejected"] } } },
        { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
      ]),
    ]);
    const r = reviewAgg[0];
    const value: SiteStats = {
      surgeons: facets.success ? facets.total : 0,
      hospitals,
      // Cities with a meaningful number of listed surgeons, not every stray location string.
      cities: facets.success ? facets.cityCount : 0,
      reviews: r?.n ?? 0,
      averageRating: r && r.n > 0 ? Math.round(r.avg * 10) / 10 : null,
    };
    cache = { at: Date.now(), value };
    return { success: true as const, ...value };
  } catch (error: unknown) {
    const errMessage = serverError("site-stats", error);
    return { success: false as const, surgeons: 0, hospitals: 0, cities: 0, reviews: 0, averageRating: null, error: errMessage };
  }
});
