import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";
import { Doctor } from "@/models/Doctor";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatDoctorName, formatSpecialization } from "@/lib/doctor-format";
import { getSpeciality } from "@/data/catalog";
import { serverError } from "@/lib/server-error";
// Doctor is imported (and used) above, which also registers the model the populate("doctorId")
// below needs — see CLAUDE.md on the MissingSchemaError populate bug.

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
/** Public review walls hide empty, "-", or one-line reviews — they read as low-effort or fake. */
const PUBLIC_MIN_COMMENT_LENGTH = 40;
/** Vowel-bearing words of 3+ letters a comment needs before it can appear on a public wall. */
const MIN_REAL_WORDS = 5;

export interface GetReviewsParams {
  minRating?: number | undefined;
  doctorId?: string | undefined;
  /** Catalog speciality slug — reviews of doctors in that speciality. */
  speciality?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  /** Minimum comment length; defaults to 40 for public lists, 1 for a single doctor's profile. */
  minLength?: number | undefined;
}

interface PopulatedDoctorRef {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  location?: string;
  slug?: string;
}

/** Doctors in a speciality who actually have reviews (bounded, so the $in stays small). */
async function reviewedDoctorIdsForSpeciality(slug: string) {
  const spec = getSpeciality(slug);
  if (!spec) return null;
  const docs = await Doctor.find({
    specialization: { $regex: spec.doctorMatch, $options: "i" },
    "rating.count": { $gt: 0 },
  })
    .select("_id")
    .sort({ "rating.count": -1 })
    .limit(3000)
    .lean();
  return docs.map((d) => d._id);
}

/**
 * Real patient reviews, with the doctor's name/specialization/city populated so the card can show
 * "treatment" and "city". Excludes pending (unmoderated) submissions and — on public walls —
 * trivially short comments. `limit` is capped; this collection has 247k+ documents.
 */
export const getReviewsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetReviewsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const minLength = data?.minLength ?? (data?.doctorId ? 1 : PUBLIC_MIN_COMMENT_LENGTH);
      const isPublicWall = !data?.doctorId;
      const filter: Record<string, unknown> = {
        status: { $nin: ["pending", "rejected"] },
        $expr: {
          $and: [
            // Keeps "-" / "ok" / whitespace-only comments out of public lists.
            { $gte: [{ $strLenCP: { $trim: { input: { $ifNull: ["$comment", ""] } } } }, minLength] },
            // ...and keyboard mash. The imported collection contains test rows that clear the
            // length bar but say nothing ("dxgfhghjil aaaaaaaaaaaaaaaa", "bhui bhjk fgh fgh dgf
            // fyu gghq gfsqgd"), and two of them were the first thing a visitor saw on /reviews.
            // Real prose has many vowel-containing words; mashed consonants have almost none, so
            // count letter-runs of 3+ characters that contain a vowel and require a handful.
            ...(isPublicWall ? [{ $gte: [{ $size: { $filter: {
              input: {
                $regexFindAll: {
                  input: { $toLower: { $ifNull: ["$comment", ""] } },
                  regex: "[a-z]*[aeiou][a-z]*",
                },
              },
              as: "w",
              cond: { $gte: [{ $strLenCP: "$$w.match" }, 3] },
            } } }, MIN_REAL_WORDS] }] : []),
          ],
        },
      };
      if (data?.minRating) filter["rating"] = { $gte: data.minRating };
      if (data?.doctorId && mongoose.isValidObjectId(data.doctorId)) {
        filter["doctorId"] = new mongoose.Types.ObjectId(data.doctorId);
      }
      if (data?.speciality) {
        const ids = await reviewedDoctorIdsForSpeciality(data.speciality);
        if (ids) filter["doctorId"] = { $in: ids };
      }

      const limit = Math.min(Math.max(data?.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);

      // Reviews an admin pinned lead the first page of the public wall. They're fetched separately
      // (sparse index on `pinned`) rather than by sorting the whole wall on a pinned flag — that
      // would take the query off the createdAt index and re-introduce the deep-page sort blow-up
      // that broke the hospital directory. They're excluded below so nobody shows up twice.
      const pinned =
        isPublicWall && page === 1
          ? await Review.find({ ...filter, pinned: true })
              .sort({ pinnedAt: -1 })
              .limit(Math.min(6, limit))
              .populate("doctorId", "firstName lastName specialization location slug")
              .lean()
          : [];
      const listFilter = pinned.length ? { ...filter, _id: { $nin: pinned.map((p) => p._id) } } : filter;

      // Rating summary over the same set, ignoring the comment-length rule (a short "5 stars, great"
      // review is still a real rating even if we don't display its text).
      const { $expr: _len, ...statsMatch } = filter;
      const [rest, total, agg] = await Promise.all([
        Review.find(listFilter)
          .sort({ createdAt: -1 })
          .skip(Math.max((page - 1) * limit - pinned.length, 0))
          .limit(Math.max(limit - pinned.length, 0))
          .populate("doctorId", "firstName lastName specialization location slug")
          .lean(),
        Review.countDocuments(filter),
        Review.aggregate([
          { $match: statsMatch },
          { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]).then((rows) => rows, () => []),
      ]);

      const stats = (agg[0] as { avg?: number; count?: number } | undefined) || { avg: 0, count: 0 };
      const docs = [...pinned, ...rest];

      return {
        success: true,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        averageRating: Math.round((stats.avg || 0) * 10) / 10,
        totalReviews: stats.count || 0,
        reviews: docs.map((doc) => {
          const doctor = doc.doctorId as unknown as PopulatedDoctorRef | null;
          const extra = doc as unknown as { city?: string; treatment?: string };
          return {
            id: String(doc._id),
            patientName: doc.patientName,
            rating: doc.rating,
            comment: doc.comment,
            doctorResponse: doc.doctorResponse || "",
            createdAt: new Date(doc.createdAt).toISOString(),
            doctorName: doctor ? formatDoctorName(doctor.firstName, doctor.lastName) : "",
            doctorSlug: doctor?.slug || "",
            treatment: extra.treatment || formatSpecialization(doctor?.specialization),
            city: extra.city || doctor?.location || "",
            pinned: Boolean(doc.pinned),
          };
        }),
      };
    } catch (error: unknown) {
      const errMessage = serverError("reviews", error);
      return {
        success: false,
        page: 1,
        limit: DEFAULT_LIMIT,
        total: 0,
        totalPages: 1,
        averageRating: 0,
        totalReviews: 0,
        reviews: [],
        error: errMessage,
      };
    }
  });

export interface SubmitReviewInput {
  doctorSlug: string;
  patientName: string;
  rating: number;
  comment: string;
  city?: string;
  treatment?: string;
}

/**
 * Public "Write a review". Stored as `status: "pending"` — never shown publicly until an admin
 * approves it, so the review wall can't be spammed or seeded with fake praise.
 */
export const submitReviewFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitReviewInput)
  .handler(async ({ data }) => {
    try {
      const name = String(data?.patientName || "").trim();
      const comment = String(data?.comment || "").trim();
      const rating = Number(data?.rating);
      if (name.length < 2) return { success: false as const, error: "Please enter your name." };
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { success: false as const, error: "Please choose a rating from 1 to 5 stars." };
      }
      if (comment.length < PUBLIC_MIN_COMMENT_LENGTH) {
        return {
          success: false as const,
          error: `Please describe your experience in at least ${PUBLIC_MIN_COMMENT_LENGTH} characters.`,
        };
      }
      if (comment.length > 3000) return { success: false as const, error: "Please keep your review under 3000 characters." };

      await connectToDatabase();
      const doctor = await Doctor.findOne({ slug: String(data.doctorSlug || "") }).select("_id").lean();
      if (!doctor) return { success: false as const, error: "Please choose the doctor who treated you." };

      const city = String(data.city || "").trim().slice(0, 60);
      const treatment = String(data.treatment || "").trim().slice(0, 80);
      await Review.create({
        doctorId: doctor._id,
        patientName: name.slice(0, 80),
        rating,
        comment,
        ...(city ? { city } : {}),
        ...(treatment ? { treatment } : {}),
        status: "pending" as const,
        source: "website",
      });
      return {
        success: true as const,
        message: "Thank you! Your review will appear once our team has checked it.",
      };
    } catch (error: unknown) {
      console.error("Review submission failed:", error);
      return { success: false as const, error: "Could not submit your review. Please try again." };
    }
  });

/**
 * Admin: pending website reviews awaiting moderation. Imported reviews held back by
 * scripts/flag-reviews.ts are also "pending" but are only counted here, not listed — there are
 * tens of thousands and they need a data decision, not one-by-one moderation.
 */
export const getPendingReviewsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  if (!isAdmin(user)) return { success: false as const, reviews: [], flagged: [], error: "Unauthorized: Admin access required." };
  await connectToDatabase();
  const [docs, flagged] = await Promise.all([
    Review.find({ status: "pending", flagReason: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("doctorId", "firstName lastName slug")
      .lean(),
    Review.aggregate<{ _id: string; n: number }>([
      { $match: { status: "pending", flagReason: { $exists: true } } },
      { $unwind: "$flagReason" },
      { $group: { _id: "$flagReason", n: { $sum: 1 } } },
      { $sort: { n: -1 } },
    ]),
  ]);
  return {
    success: true as const,
    flagged: flagged.map((f) => ({ reason: f._id, count: f.n })),
    reviews: docs.map((d) => {
      const doc = d.doctorId as unknown as PopulatedDoctorRef | null;
      return {
        id: String(d._id),
        patientName: d.patientName,
        rating: d.rating,
        comment: d.comment,
        doctorName: doc ? formatDoctorName(doc.firstName, doc.lastName) : "",
        createdAt: new Date(d.createdAt).toISOString(),
      };
    }),
  };
});

/** Admin: approve or reject a pending review. */
export const moderateReviewFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string; decision: "approved" | "rejected" })
  .handler(async ({ data }) => {
    const user = await getSessionUser();
    if (!isAdmin(user)) return { success: false as const, error: "Unauthorized: Admin access required." };
    if (!["approved", "rejected"].includes(data.decision)) return { success: false as const, error: "Invalid decision." };
    await connectToDatabase();
    // Only website submissions are moderated here; flagged imports are handled by the script.
    await Review.updateOne({ _id: data.id, status: "pending", flagReason: { $exists: false } }, { status: data.decision });
    return { success: true as const };
  });

export type AdminReviewTab = "all" | "pending" | "approved" | "pinned" | "flagged";

/**
 * Admin: browse the review wall itself, not just the moderation queue.
 *
 * Deliberately paginated and search-first rather than "load all": the tab counts run into six
 * figures. "Pending" here means website submissions awaiting a decision; imported reviews held
 * back by scripts/flag-reviews.ts get their own tab so the two never get confused.
 */
export const getAdminReviewsFn = createServerFn({ method: "GET" })
  .validator((data: { tab?: AdminReviewTab; query?: string; page?: number }) => data ?? {})
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!isAdmin(user)) return { success: false as const, error: "Unauthorized: Admin access required." };
      await connectToDatabase();

      const tab: AdminReviewTab = data?.tab ?? "all";
      const page = Math.max(Number(data?.page) || 1, 1);
      const limit = 25;

      const filters: Record<AdminReviewTab, Record<string, unknown>> = {
        all: {},
        pending: { status: "pending", flagReason: { $exists: false } },
        approved: { status: { $nin: ["pending", "rejected"] } },
        pinned: { pinned: true },
        flagged: { flagReason: { $exists: true } },
      };
      const filter: Record<string, unknown> = { ...filters[tab] };

      const query = String(data?.query || "").trim();
      if (query) {
        const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter["$or"] = [{ patientName: re }, { comment: re }, { city: re }];
      }

      const [docs, total, counts] = await Promise.all([
        Review.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("doctorId", "firstName lastName specialization location slug")
          .lean(),
        // A filtered count can scan a lot of documents; an unfiltered one is instant metadata.
        Object.keys(filter).length ? Review.countDocuments(filter) : Review.estimatedDocumentCount(),
        Promise.all([
          Review.countDocuments({ status: "pending", flagReason: { $exists: false } }),
          Review.countDocuments({ pinned: true }),
          Review.countDocuments({ flagReason: { $exists: true } }),
        ]),
      ]);

      return {
        success: true as const,
        tab,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        counts: { pending: counts[0], pinned: counts[1], flagged: counts[2] },
        reviews: docs.map((d) => {
          const doc = d.doctorId as unknown as PopulatedDoctorRef | null;
          const extra = d as unknown as { city?: string; treatment?: string };
          return {
            id: String(d._id),
            patientName: d.patientName,
            rating: d.rating,
            comment: d.comment,
            doctorName: doc ? formatDoctorName(doc.firstName, doc.lastName) : "",
            doctorSlug: doc?.slug || "",
            speciality: formatSpecialization(doc?.specialization),
            city: extra.city || doc?.location || "",
            status: d.status || "published",
            pinned: Boolean(d.pinned),
            flagReason: d.flagReason || [],
            createdAt: new Date(d.createdAt).toISOString(),
          };
        }),
      };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("getAdminReviews", error) };
    }
  });

/**
 * Admin: pin or unpin a review so it leads the public wall.
 *
 * There is no delete here on purpose. The reference dashboard puts a red Delete next to every
 * review; removing a patient's words is irreversible and, for the imported set, destroys the only
 * evidence of what the original data said. Rejecting hides a review just as effectively and can
 * be undone (CLAUDE.md: nothing is deleted from the database).
 */
export const pinReviewFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; pinned: boolean }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!isAdmin(user)) return { success: false as const, error: "Unauthorized: Admin access required." };
      await connectToDatabase();

      const pinned = Boolean(data?.pinned);
      const review = await Review.findById(data?.id);
      if (!review) return { success: false as const, error: "That review no longer exists." };

      // Pinning something the wall would never show (held back, rejected, or too short) would
      // silently do nothing on the site, so say so instead.
      if (pinned && (review.status === "pending" || review.status === "rejected")) {
        return { success: false as const, error: "Approve this review before pinning it." };
      }

      review.pinned = pinned;
      if (pinned) review.pinnedAt = new Date();
      await review.save();
      return { success: true as const, pinned };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("pinReview", error) };
    }
  });

/** Admin: hide a published review (reversible) or restore a hidden one. */
export const setReviewVisibilityFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; visible: boolean }) => data)
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!isAdmin(user)) return { success: false as const, error: "Unauthorized: Admin access required." };
      await connectToDatabase();

      const visible = Boolean(data?.visible);
      const update = visible
        ? { status: "approved", $unset: { flaggedAt: "" } }
        : { status: "rejected", pinned: false };
      const res = await Review.findByIdAndUpdate(data?.id, update, { new: true });
      if (!res) return { success: false as const, error: "That review no longer exists." };
      return { success: true as const, visible };
    } catch (error: unknown) {
      return { success: false as const, error: serverError("setReviewVisibility", error) };
    }
  });
