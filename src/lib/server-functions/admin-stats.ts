import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { serverError } from "@/lib/server-error";
import { User } from "@/models/User";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { Review } from "@/models/Review";
import { Consultation } from "@/models/Consultation";
import { ClickEvent } from "@/models/ClickEvent";
import { Question } from "@/models/Question";
import { InsuranceCheck } from "@/models/InsuranceCheck";
import { BLOG_POSTS } from "@/data/blog";

/**
 * Counts for the Overview screen.
 *
 * Month-on-month change is only reported for collections this site wrote itself — patients,
 * bookings and tracked clicks. Doctors, hospitals and reviews were bulk-imported, so their
 * timestamps describe the source platform's history, not activity here; a percentage off those
 * would be a made-up number. (Reviews initially had one, and it read "-100%" purely because the
 * import contains nothing from the last 30 days.) Those cards return `change: null` and the UI
 * omits the line entirely.
 */
export const getAdminOverviewFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await requireAdminUser();
    await connectToDatabase();

    const now = Date.now();
    const thisMonthStart = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const windowed = async (model: { countDocuments: (f: Record<string, unknown>) => Promise<number> }) => {
      const [recent, prior] = await Promise.all([
        model.countDocuments({ createdAt: { $gte: thisMonthStart } }),
        model.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
      ]);
      // No prior activity means there's no percentage to state — not "+100%".
      return { recent, change: prior > 0 ? Math.round(((recent - prior) / prior) * 100) : null };
    };

    const [
      totalUsers,
      suspendedUsers,
      totalDoctors,
      totalHospitals,
      totalReviews,
      pendingReviews,
      totalBookings,
      pendingBookings,
      totalClicks,
      openQuestions,
      openInsurance,
      userTrend,
      bookingTrend,
      clickTrend,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "suspended" }),
      Doctor.estimatedDocumentCount(),
      Hospital.estimatedDocumentCount(),
      Review.estimatedDocumentCount(),
      Review.countDocuments({ status: "pending" }),
      Consultation.countDocuments({}),
      Consultation.countDocuments({ status: "pending" }),
      ClickEvent.estimatedDocumentCount(),
      Question.countDocuments({ status: "pending" }),
      InsuranceCheck.countDocuments({ status: "pending" }),
      windowed(User),
      windowed(Consultation),
      windowed(ClickEvent),
    ]);

    return {
      success: true as const,
      generatedAt: new Date().toISOString(),
      cards: [
        {
          key: "users",
          label: "Registered patients",
          value: totalUsers,
          hint: `${suspendedUsers} suspended`,
          change: userTrend.change,
          recent: userTrend.recent,
        },
        {
          key: "bookings",
          label: "Booking requests",
          value: totalBookings,
          hint: `${pendingBookings} awaiting a call`,
          change: bookingTrend.change,
          recent: bookingTrend.recent,
        },
        {
          key: "doctors",
          label: "Doctors",
          value: totalDoctors,
          hint: "In the directory",
          change: null,
          recent: null,
        },
        {
          key: "hospitals",
          label: "Hospitals",
          value: totalHospitals,
          hint: "In the directory",
          change: null,
          recent: null,
        },
        {
          key: "reviews",
          label: "Reviews",
          value: totalReviews,
          hint: `${pendingReviews.toLocaleString("en-IN")} held for moderation`,
          change: null,
          recent: null,
        },
        {
          key: "clicks",
          label: "Call & WhatsApp clicks",
          value: totalClicks,
          hint: "Since tracking was switched on",
          change: clickTrend.change,
          recent: clickTrend.recent,
        },
        {
          key: "blog",
          label: "Blog articles",
          value: BLOG_POSTS.length,
          hint: "Published on the site",
          change: null,
          recent: null,
        },
        {
          key: "questions",
          label: "Unanswered questions",
          value: openQuestions,
          hint: "From /ask-a-question",
          change: null,
          recent: null,
        },
      ],
      // Things a person needs to act on, so the dashboard opens on work rather than vanity counts.
      actionQueue: [
        { key: "bookings", label: "Booking requests awaiting a call", count: pendingBookings },
        { key: "reviews", label: "Reviews waiting for moderation", count: pendingReviews },
        { key: "questions", label: "Patient questions unanswered", count: openQuestions },
        { key: "insurance", label: "Insurance checks not yet processed", count: openInsurance },
      ],
    };
  } catch (error: unknown) {
    return { success: false as const, error: serverError("getAdminOverview", error) };
  }
});
