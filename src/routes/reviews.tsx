import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { OrangeButton, Container, SectionHead, Eyebrow, OutlineButton } from "@/components/home/primitives";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { seo } from "@/lib/seo";

const ratingOptions = [
  { label: "All ratings", value: 0 },
  { label: "5 stars", value: 5 },
  { label: "4 stars & up", value: 4 },
  { label: "3 stars & up", value: 3 },
];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex shrink-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rounded ? "fill-brand-orange text-brand-orange" : "text-border"}`}
        />
      ))}
    </div>
  );
}

interface ReviewCard {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  doctorResponse: string;
  createdAt: string;
  doctorName: string;
  doctorSlug: string;
  treatment: string;
  city: string;
}

function ReviewCardItem({ review }: { review: ReviewCard }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 220;
  const shown = expanded || !isLong ? review.comment : `${review.comment.slice(0, 220)}…`;

  return (
    <article className="break-inside-avoid rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
            {review.patientName
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">{review.patientName}</p>
            <p className="text-[11px] text-muted-foreground">
              {[review.treatment, review.city].filter(Boolean).join(" · ") || "Go Surgery patient"}
            </p>
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        "{shown}"
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-1 font-semibold text-brand-orange hover:underline"
          >
            {expanded ? "Show less" : "Read More"}
          </button>
        )}
      </p>
      {review.doctorResponse && (
        <div className="mt-3 rounded-lg bg-cream p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-navy/70">
            Response from the doctor
          </p>
          <p className="mt-1 text-xs text-ink/70">{review.doctorResponse}</p>
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted-foreground">{timeAgo(review.createdAt)}</p>
    </article>
  );
}

export const Route = createFileRoute("/reviews")({
  loader: async () => {
    try {
      return await getReviewsFn({ data: { page: 1 } });
    } catch {
      return {
        success: false,
        reviews: [],
        total: 0,
        page: 1,
        limit: 24,
        averageRating: 0,
        totalReviews: 0,
      };
    }
  },
  head: () =>
    seo({
      title: "Patient Reviews & Stories",
      description: "Read what patients say about doctors in the Go Surgery directory — ratings, treatments and cities — and share your own experience.",
      path: "/reviews",
    }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const initialData = Route.useLoaderData();
  const [reviews, setReviews] = useState<ReviewCard[]>(initialData?.reviews || []);
  const [page, setPage] = useState(initialData?.page || 1);
  const [minRating, setMinRating] = useState(0);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [averageRating] = useState(initialData?.averageRating || 0);
  const [totalReviews] = useState(initialData?.totalReviews || 0);
  const [isLoading, setIsLoading] = useState(false);
  const limit = initialData?.limit || 24;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      try {
        const res = await getReviewsFn({ data: { page, minRating: minRating || undefined } });
        if (isMounted && res.success) {
          setReviews(res.reviews);
          setTotal(res.total);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, minRating]);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Real reviews from real patients</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Patient Reviews & Stories
            </h1>
            <div className="mt-6 flex items-center gap-2">
              <StarRow rating={averageRating} />
              <span className="ml-1 text-sm font-semibold text-navy-foreground">
                {averageRating || "—"} out of 5 — from {totalReviews.toLocaleString("en-US")} reviews
              </span>
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead
              eyebrow="What our patients say"
              title="Patient Reviews"
              subtitle="Reviews left by patients for doctors in our directory. Very short reviews aren't shown here."
              action={
                <a href="/reviews/write">
                  <OrangeButton>Write a Review</OrangeButton>
                </a>
              }
            />
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {ratingOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setMinRating(opt.value);
                    setPage(1);
                  }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    minRating === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-ink/70 hover:border-navy/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              {isLoading && (
                <span className="flex items-center gap-1.5 text-xs text-brand-orange font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
                </span>
              )}
            </div>

            {reviews.length === 0 && !isLoading ? (
              <div className="py-16 text-center text-muted-foreground">
                No reviews match this filter yet.
              </div>
            ) : (
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
                {reviews.map((r) => (
                  <ReviewCardItem key={r.id} review={r} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <OutlineButton
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </OutlineButton>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages.toLocaleString("en-US")}
                </span>
                <OutlineButton
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </OutlineButton>
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
