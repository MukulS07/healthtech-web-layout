import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Review } from "@/models/Review";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;

export interface GetReviewsParams {
  minRating?: number;
  doctorId?: string;
  page?: number;
  limit?: number;
}

interface PopulatedDoctorRef {
  _id: unknown;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  location?: string;
  slug?: string;
}

/**
 * Server function to fetch real patient reviews from MongoDB, with the doctor's name/
 * specialization/city populated in so the card can show "treatment" and "city" the way the
 * reference site's reviews wall does. `limit` is capped — this collection has 247k+ documents.
 */
export const getReviewsFn = createServerFn({ method: "GET" })
  .validator((data?: unknown) => (data as GetReviewsParams) || {})
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      const filter: Record<string, unknown> = {};
      if (data?.minRating) {
        filter["rating"] = { $gte: data.minRating };
      }
      if (data?.doctorId) {
        filter["doctorId"] = data.doctorId;
      }

      const limit = Math.min(data?.limit || DEFAULT_LIMIT, MAX_LIMIT);
      const page = Math.max(data?.page || 1, 1);

      const [docs, total, agg] = await Promise.all([
        Review.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("doctorId", "firstName lastName specialization location slug")
          .lean(),
        Review.countDocuments(filter),
        Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }]),
      ]);

      const stats = agg[0] || { avg: 0, count: 0 };

      return {
        success: true,
        page,
        limit,
        total,
        averageRating: Math.round((stats.avg || 0) * 10) / 10,
        totalReviews: stats.count || 0,
        reviews: docs.map((doc) => {
          const doctor = doc.doctorId as unknown as PopulatedDoctorRef | null;
          const doctorName = doctor
            ? [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim()
            : "";
          return {
            id: String(doc._id),
            patientName: doc.patientName,
            rating: doc.rating,
            comment: doc.comment,
            doctorResponse: doc.doctorResponse || "",
            createdAt: new Date(doc.createdAt).toISOString(),
            doctorName,
            doctorSlug: doctor?.slug || "",
            treatment: doctor?.specialization || "",
            city: doctor?.location || "",
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
        averageRating: 0,
        totalReviews: 0,
        reviews: [],
        error: errMessage,
      };
    }
  });
