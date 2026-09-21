import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser, revokeAllSessions } from "@/lib/auth";
import { serverError } from "@/lib/server-error";
import { User } from "@/models/User";
import { Consultation } from "@/models/Consultation";

const PAGE_SIZE = 50;

/** Escapes a search term so a patient called "R. (Raj)" doesn't become a broken regex. */
function safeRegex(term: string): RegExp {
  return new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

export type AdminUserFilters = {
  query?: string | undefined;
  status?: "all" | "active" | "suspended" | undefined;
  page?: number | undefined;
};

/**
 * Patient accounts, searchable by name / email / phone, with the counts the header cards show.
 * Returns a page at a time — this list grows with every signup and there's no reason to ship all
 * of it to the browser.
 */
export const getAdminUsersFn = createServerFn({ method: "GET" })
  .validator((data: AdminUserFilters) => data ?? {})
  .handler(async ({ data }) => {
    try {
      await requireAdminUser();
      await connectToDatabase();

      const page = Math.max(Number(data?.page) || 1, 1);
      const filter: Record<string, unknown> = {};

      if (data?.status === "suspended") filter["status"] = "suspended";
      if (data?.status === "active") filter["status"] = { $ne: "suspended" };

      const query = String(data?.query || "").trim();
      if (query) {
        const re = safeRegex(query);
        filter["$or"] = [{ name: re }, { email: re }, { phone: re }];
      }

      const [docs, total, activeCount, suspendedCount, allCount] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .lean(),
        User.countDocuments(filter),
        User.countDocuments({ status: { $ne: "suspended" } }),
        User.countDocuments({ status: "suspended" }),
        User.countDocuments({}),
      ]);

      // One grouped query rather than a lookup per row.
      const ids = docs.map((d) => d._id);
      const bookingCounts = await Consultation.aggregate([
        { $match: { userId: { $in: ids } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]);
      const bookingsByUser = new Map(bookingCounts.map((b) => [String(b._id), b.count as number]));

      return {
        success: true as const,
        users: docs.map((u) => ({
          id: String(u._id),
          name: u.name,
          email: u.email,
          phone: u.phone || "",
          role: u.role || "patient",
          status: u.status === "suspended" ? ("suspended" as const) : ("active" as const),
          suspendedReason: u.suspendedReason || "",
          twoFactor: Boolean(u.totpEnabled),
          bookings: bookingsByUser.get(String(u._id)) ?? 0,
          createdAt: new Date(u.createdAt).toISOString(),
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
        })),
        page,
        totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
        total,
        counts: { active: activeCount, suspended: suspendedCount, all: allCount },
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getAdminUsers", error) };
    }
  });

/**
 * Suspends or restores an account.
 *
 * There is deliberately no delete: the reference dashboard this was modelled on has a Delete
 * button next to every patient, but a patient row is attached to their booking history, and
 * removing it would silently orphan those records. Suspension blocks login, ends any session
 * they already have, and is undone with one click. (Standing rule in CLAUDE.md: nothing is
 * deleted from the database — unusable data is held, flagged, reversibly.)
 */
export const setUserStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: "active" | "suspended"; reason?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const admin = await requireAdminUser();
      await connectToDatabase();

      if (data?.status !== "active" && data?.status !== "suspended") {
        return { success: false as const, error: "Unknown status." };
      }

      const target = await User.findById(data.id);
      if (!target) return { success: false as const, error: "That account no longer exists." };

      // An admin locking themselves out of the panel is never what they meant to do.
      if (String(target._id) === String(admin._id)) {
        return { success: false as const, error: "You can't suspend your own account." };
      }

      if (data.status === "suspended") {
        target.status = "suspended";
        target.suspendedAt = new Date();
        target.suspendedReason = String(data.reason || "").trim().slice(0, 200);
        await target.save();
        // Suspension has to take effect now, not in 30 days when their cookie expires.
        const revoked = await revokeAllSessions(String(target._id));
        return { success: true as const, status: "suspended" as const, sessionsRevoked: revoked };
      }

      target.status = "active";
      target.suspendedAt = null;
      target.suspendedReason = "";
      await target.save();
      return { success: true as const, status: "active" as const, sessionsRevoked: 0 };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("setUserStatus", error) };
    }
  });
