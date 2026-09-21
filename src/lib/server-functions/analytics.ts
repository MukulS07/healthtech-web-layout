import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { ClickEvent, type ClickType } from "@/models/ClickEvent";
import { Consultation } from "@/models/Consultation";
import { Doctor } from "@/models/Doctor";
import { getSessionUser, requireAdminUser } from "@/lib/auth";
import { serverError } from "@/lib/server-error";
import { isObjectIdLike } from "@/lib/admin-constants";

const CLICK_TYPES: ClickType[] = ["call", "whatsapp", "profile_click", "directions", "enquiry"];
const TARGET_TYPES = ["doctor", "hospital", "site"] as const;

/** Trims free text before it reaches the database — these values come from the public internet. */
function clean(value: unknown, max = 160): string | undefined {
  const text = String(value ?? "").trim().slice(0, max);
  return text || undefined;
}

/**
 * Aggregation pipelines don't cast types the way queries do, so `$match` on an ObjectId field
 * needs a real ObjectId. Mongoose is imported here rather than at the top of the file: this module
 * is reachable from client components (via lib/track), and a top-level driver import ends up in
 * the browser bundle. Inside a handler it is stripped out with the rest of the server code.
 */
async function toObjectId(value: unknown) {
  if (!isObjectIdLike(value)) return undefined;
  const { Types } = await import("mongoose");
  return new Types.ObjectId(value);
}

export type TrackClickInput = {
  type: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  targetPhone?: string;
  city?: string;
  speciality?: string;
  sourcePage?: string;
  locale?: string;
  visitorId?: string;
};

/**
 * Records one call / WhatsApp / profile interaction. Public by design — it's fired from the page
 * a patient is already looking at — so it writes only a fixed set of fields, all length-capped,
 * and never trusts the caller for anything privileged. Unknown event types are dropped rather
 * than stored, so a scripted caller can't invent new categories in the admin reports.
 *
 * Failures are swallowed: a tracking write must never break the call the patient is trying to make.
 */
export const trackClickFn = createServerFn({ method: "POST" })
  .validator((data: TrackClickInput) => data)
  .handler(async ({ data }) => {
    try {
      const type = String(data?.type || "") as ClickType;
      if (!CLICK_TYPES.includes(type)) return { success: false as const };

      const targetTypeRaw = String(data?.targetType || "site");
      const targetType = (TARGET_TYPES as readonly string[]).includes(targetTypeRaw)
        ? (targetTypeRaw as (typeof TARGET_TYPES)[number])
        : "site";

      await connectToDatabase();

      // Only ever taken from the session cookie — never from the request body.
      let userId: unknown;
      try {
        const user = await getSessionUser();
        if (user) userId = user._id;
      } catch {
        /* guests are the normal case */
      }

      // Mongoose casts a 24-hex string to an ObjectId when saving a document.
      const targetId = isObjectIdLike(data?.targetId) ? data.targetId : undefined;
      // Built as a plain object and cast once: with exactOptionalPropertyTypes, Mongoose's create()
      // overloads reject conditionally-spread optional fields even though they're never undefined.
      const event: Record<string, unknown> = { type, targetType };
      const optional: Record<string, unknown> = {
        targetId,
        targetName: clean(data?.targetName),
        targetPhone: clean(data?.targetPhone, 24),
        city: clean(data?.city, 80),
        speciality: clean(data?.speciality, 80),
        sourcePage: clean(data?.sourcePage, 300),
        locale: clean(data?.locale, 8),
        visitorId: clean(data?.visitorId, 64),
        userId,
      };
      for (const [key, value] of Object.entries(optional)) {
        if (value !== undefined) event[key] = value;
      }
      await ClickEvent.create(event);

      return { success: true as const };
    } catch (error: unknown) {
      console.error("trackClick failed:", error instanceof Error ? error.message : String(error));
      return { success: false as const };
    }
  });

export type ClickFilters = {
  from?: string | undefined;
  to?: string | undefined;
  city?: string | undefined;
  type?: string | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
  limit?: number | undefined;
};

/** Start of day / end of day so a date picker behaves the way an admin expects. */
function dayRange(from?: string, to?: string): { $gte?: Date; $lte?: Date } | null {
  const range: { $gte?: Date; $lte?: Date } = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) range.$gte = new Date(d.setHours(0, 0, 0, 0));
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) range.$lte = new Date(d.setHours(23, 59, 59, 999));
  }
  return range.$gte || range.$lte ? range : null;
}

function buildMatch(f: ClickFilters, targetId?: unknown): Record<string, unknown> {
  const match: Record<string, unknown> = {};
  const range = dayRange(f.from, f.to);
  if (range) match["createdAt"] = range;
  if (f.city) match["city"] = f.city;
  if (f.type && CLICK_TYPES.includes(f.type as ClickType)) match["type"] = f.type;
  if (f.targetType && (TARGET_TYPES as readonly string[]).includes(f.targetType)) {
    match["targetType"] = f.targetType;
  }
  if (targetId) match["targetId"] = targetId;
  return match;
}

/**
 * Everything the Call & WhatsApp screen needs, in one round trip: headline counts, a 30-day
 * trend, and the most recent interactions grouped by profile + channel (so a patient who rang
 * the same surgeon four times is one row saying "4×", not four rows).
 */
export const getClickAnalyticsFn = createServerFn({ method: "GET" })
  .validator((data: ClickFilters) => data ?? {})
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const match = buildMatch(data, await toObjectId(data?.targetId));
      const rowLimit = Math.min(Math.max(Number(data?.limit) || 100, 10), 500);
      const trendStart = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      trendStart.setHours(0, 0, 0, 0);
      // The trend is always the last 30 days, but it must never show days the filter excludes.
      const filterRange = (match["createdAt"] as { $gte?: Date; $lte?: Date } | undefined) ?? {};
      const trendMatch = {
        ...match,
        createdAt: {
          ...filterRange,
          $gte: filterRange.$gte && filterRange.$gte > trendStart ? filterRange.$gte : trendStart,
        },
      };

      const [totalsAgg, uniqueAgg, trendAgg, rowsAgg, cityAgg] = await Promise.all([
        ClickEvent.aggregate([{ $match: match }, { $group: { _id: "$type", count: { $sum: 1 } } }]),
        ClickEvent.aggregate([
          { $match: match },
          // Logged-in visitors count once per account; guests count once per browser.
          { $group: { _id: { $ifNull: ["$userId", { $ifNull: ["$visitorId", "$_id"] }] } } },
          { $count: "count" },
        ]),
        ClickEvent.aggregate([
          { $match: trendMatch },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: 1 },
              call: { $sum: { $cond: [{ $eq: ["$type", "call"] }, 1, 0] } },
              whatsapp: { $sum: { $cond: [{ $eq: ["$type", "whatsapp"] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        ClickEvent.aggregate([
          { $match: match },
          { $sort: { createdAt: -1 } },
          { $limit: 5000 },
          {
            $group: {
              _id: {
                type: "$type",
                targetId: "$targetId",
                targetName: "$targetName",
                visitor: { $ifNull: ["$userId", "$visitorId"] },
              },
              clicks: { $sum: 1 },
              lastClick: { $max: "$createdAt" },
              city: { $first: "$city" },
              targetType: { $first: "$targetType" },
              targetPhone: { $first: "$targetPhone" },
              userId: { $first: "$userId" },
            },
          },
          { $sort: { lastClick: -1 } },
          { $limit: rowLimit },
        ]),
        ClickEvent.aggregate([
          { $match: { city: { $nin: [null, ""] } } },
          { $group: { _id: "$city", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 100 },
        ]),
      ]);

      const byType: Record<string, number> = {};
      for (const row of totalsAgg) byType[String(row._id)] = row.count as number;
      const total = Object.values(byType).reduce((sum, n) => sum + n, 0);

      // Fill missing days so the chart shows a real 30-day window, not just the days with clicks.
      const trendMap = new Map(trendAgg.map((t) => [String(t._id), t]));
      const trend: { date: string; total: number; call: number; whatsapp: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const hit = trendMap.get(key);
        trend.push({
          date: key,
          total: (hit?.total as number) ?? 0,
          call: (hit?.call as number) ?? 0,
          whatsapp: (hit?.whatsapp as number) ?? 0,
        });
      }

      return {
        success: true as const,
        totals: {
          total,
          call: byType["call"] ?? 0,
          whatsapp: byType["whatsapp"] ?? 0,
          profileClicks: byType["profile_click"] ?? 0,
          enquiries: byType["enquiry"] ?? 0,
          uniqueVisitors: (uniqueAgg[0]?.count as number) ?? 0,
        },
        trend,
        rows: rowsAgg.map((r) => ({
          type: String(r._id.type),
          targetId: r._id.targetId ? String(r._id.targetId) : null,
          targetName: (r._id.targetName as string) || "—",
          targetType: (r.targetType as string) || "site",
          targetPhone: (r.targetPhone as string) || "",
          city: (r.city as string) || "",
          clicks: r.clicks as number,
          lastClick: new Date(r.lastClick).toISOString(),
          isGuest: !r.userId,
        })),
        cities: cityAgg.map((c) => ({ name: String(c._id), count: c.count as number })),
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getClickAnalytics", error) };
    }
  });

/** CSV of the interactions matching the current filter, for the Export button. */
export const exportClicksCsvFn = createServerFn({ method: "GET" })
  .validator((data: ClickFilters) => data ?? {})
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const docs = await ClickEvent.find(buildMatch(data, await toObjectId(data?.targetId)))
        .sort({ createdAt: -1 })
        .limit(10000)
        .lean();

      const header = ["Timestamp", "Type", "Profile", "Profile type", "Phone", "City", "Page", "Language", "Visitor"];
      const escape = (v: unknown) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = docs.map((d) =>
        [
          new Date(d.createdAt).toISOString(),
          d.type,
          d.targetName || "",
          d.targetType,
          d.targetPhone || "",
          d.city || "",
          d.sourcePage || "",
          d.locale || "en",
          d.userId ? "registered" : "guest",
        ]
          .map(escape)
          .join(","),
      );

      return { success: true as const, csv: [header.join(","), ...lines].join("\n"), rows: docs.length };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("exportClicksCsv", error) };
    }
  });

/** Percentage of the profile fields patients actually look for that this doctor has filled in. */
function profileScore(doc: Record<string, unknown>): { score: number; missing: string[] } {
  const checks: { label: string; ok: boolean }[] = [
    { label: "Photo", ok: Boolean(doc["avatar"]) },
    { label: "Qualification", ok: Boolean(doc["qualification"]) },
    { label: "Specialization", ok: Boolean(doc["specialization"]) },
    { label: "Experience", ok: Number(doc["experience"]) > 0 },
    { label: "City", ok: Boolean(doc["location"]) },
    { label: "Locality", ok: Boolean(doc["locality"]) },
    { label: "Phone", ok: Boolean(doc["phone"] || doc["mobile"]) },
    { label: "About", ok: Boolean(doc["about"] || doc["description"]) },
    { label: "Languages", ok: Array.isArray(doc["languages"]) && (doc["languages"] as unknown[]).length > 0 },
    { label: "Registration number", ok: Boolean(doc["registrationNumber"]) },
  ];
  const done = checks.filter((c) => c.ok).length;
  return {
    score: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}

/**
 * Per-doctor view: how often their profile was opened, called or messaged, how many enquiries
 * they've had, and which profile fields are still blank.
 */
export const getDoctorAnalyticsFn = createServerFn({ method: "GET" })
  .validator((data: { doctorId: string; days?: number }) => data)
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const doctorId = await toObjectId(data?.doctorId);
      if (!doctorId) return { success: false as const, error: "Unknown doctor." };

      const days = Math.min(Math.max(Number(data?.days) || 30, 1), 365);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const previousSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
      const monthsStart = new Date();
      monthsStart.setMonth(monthsStart.getMonth() - 6, 1);
      monthsStart.setHours(0, 0, 0, 0);

      const doctor = await Doctor.findById(doctorId).lean();
      if (!doctor) return { success: false as const, error: "Unknown doctor." };

      const name = [doctor["firstName"], doctor["lastName"]].filter(Boolean).join(" ").trim();

      const [current, previous, monthly, enquiries, recentEnquiries] = await Promise.all([
        ClickEvent.aggregate([
          { $match: { targetId: doctorId, createdAt: { $gte: since } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        ClickEvent.aggregate([
          { $match: { targetId: doctorId, createdAt: { $gte: previousSince, $lt: since } } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
        ClickEvent.aggregate([
          { $match: { targetId: doctorId, createdAt: { $gte: monthsStart } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              total: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Consultation.countDocuments({ assignedDoctorId: doctorId, createdAt: { $gte: since } }),
        Consultation.find({ assignedDoctorId: doctorId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("name city treatment status createdAt")
          .lean(),
      ]);

      const sum = (rows: { _id: unknown; count: number }[], type: string) =>
        rows.find((r) => String(r._id) === type)?.count ?? 0;

      const profileClicks = sum(current, "profile_click");
      const previousProfileClicks = sum(previous, "profile_click");
      const { score, missing } = profileScore(doctor as unknown as Record<string, unknown>);

      return {
        success: true as const,
        doctor: {
          id: String(doctor._id),
          name: name || "Unnamed doctor",
          specialization: (doctor["specialization"] as string) || "",
          city: (doctor["location"] as string) || "",
        },
        days,
        stats: {
          profileClicks,
          call: sum(current, "call"),
          whatsapp: sum(current, "whatsapp"),
          directions: sum(current, "directions"),
          enquiries,
          // Null rather than 0% when there's no earlier period to compare against.
          profileClicksChange:
            previousProfileClicks > 0
              ? Math.round(((profileClicks - previousProfileClicks) / previousProfileClicks) * 100)
              : null,
        },
        monthly: monthly.map((m) => ({ month: String(m._id), total: m.total as number })),
        profileScore: score,
        missingFields: missing,
        recentEnquiries: recentEnquiries.map((e) => ({
          id: String(e._id),
          name: e.name,
          city: e.city,
          treatment: e.treatment,
          status: e.status,
          createdAt: new Date(e.createdAt).toISOString(),
        })),
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getDoctorAnalytics", error) };
    }
  });
