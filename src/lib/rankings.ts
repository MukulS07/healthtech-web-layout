import type { Types } from "mongoose";
import { DoctorRanking } from "@/models/DoctorRanking";

/**
 * The doctors an admin has pinned to a speciality in a city, in the order they set.
 *
 * Shared by the admin editor and the public doctor listing so both read pins the same way. Reads
 * are cached briefly per server instance: the listing calls this on every page-1 request, while
 * pins change a handful of times a week.
 */
const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, { at: number; ids: string[] }>();

function key(speciality: string, city: string): string {
  return `${speciality.toLowerCase()}|${city.toLowerCase()}`;
}

export async function pinnedDoctorIds(speciality?: string, city?: string): Promise<string[]> {
  if (!speciality || !city) return [];
  const k = key(speciality, city);
  const hit = cache.get(k);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.ids;

  const doc = await DoctorRanking.findOne({ speciality, city }).lean();
  const ids = (doc?.doctorIds ?? []).map((id: Types.ObjectId) => String(id));
  cache.set(k, { at: Date.now(), ids });
  return ids;
}

/** Called after an admin saves, so the change shows on the site immediately. */
export function clearRankingCache(speciality?: string, city?: string): void {
  if (speciality && city) cache.delete(key(speciality, city));
  else cache.clear();
}
