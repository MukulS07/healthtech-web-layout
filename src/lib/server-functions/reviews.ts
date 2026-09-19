import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";
import { Doctor } from "@/models/Doctor";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { formatDoctorName, formatSpecialization } from "@/lib/doctor-format";
import { getSpeciality } from "@/data/catalog";
// Doctor is imported (and used) above, which also registers the model the populate("doctorId")
// below needs — see CLAUDE.md on the MissingSchemaError populate bug.

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
/** Public review walls hide empty, "-", or one-line reviews — they read as low-effort or fake. */
const PUBLIC_MIN_COMMENT_LENGTH = 40;

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
      const filter: Record<string, unknown> = {
        status: { $nin: ["pending", "rejected"] },
        // Mongo $expr keeps "-" / "ok" / whitespace-only comments out of public lists.
        $expr: { $gte: [{ $strLenCP: { $trim: { input: { $ifNull: ["$comment", ""] } } } }, minLength] },
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

      // Rating summary over the same set, ignoring the comment-length rule (a short "5 stars, great"
      // review is still a real rating even if we don't display its text).
      const { $expr: _len, ...statsMatch } = filter;
      const [docs, total, agg] = await Promise.all([
        Review.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("doctorId", "firstName lastName specialization location slug")
          .lean(),
        Review.countDocuments(filter),
        Review.aggregate([
          { $match: statsMatch },
          { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]).then((rows) => rows, () => []),
      ]);

      const stats = (agg[0] as { avg?: number; count?: number } | undefined) || { avg: 0, count: 0 };

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
          };
        }),
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
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

/** Admin: pending website reviews awaiting moderation. */
export const getPendingReviewsFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getSessionUser();
  if (!isAdmin(user)) return { success: false as const, reviews: [], error: "Unauthorized: Admin access required." };
  await connectToDatabase();
  const docs = await Review.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("doctorId", "firstName lastName slug")
    .lean();
  return {
    success: true as const,
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
    await Review.updateOne({ _id: data.id, status: "pending" }, { status: data.decision });
    return { success: true as const };
  });
