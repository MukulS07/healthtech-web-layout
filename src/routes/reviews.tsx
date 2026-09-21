import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { OrangeButton, Container, SectionHead, Eyebrow } from "@/components/home/primitives";
import { Pagination } from "@/components/common/Pagination";
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
      {/* break-words so a single long unbroken token can't widen the column (see the matching
          note on the homepage testimonial cards). */}
      <p className="mt-3 break-words text-sm leading-relaxed text-ink/80">
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

type ReviewsSearch = { page?: number | undefined; rating?: number | undefined };

/** "?rating=4&page=3" — omits defaults so page 1 / all ratings stays on the bare /reviews URL. */
function reviewsHref(search: ReviewsSearch, patch: Partial<ReviewsSearch>) {
  const next = { ...search, ...patch };
  const params = new URLSearchParams();
  if (next.rating) params.set("rating", String(next.rating));
  if (next.page && next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return `/reviews${qs ? `?${qs}` : ""}`;
}

export const Route = createFileRoute("/reviews")({
  // Paging and the rating filter live in the URL, like /doctors and /hospitals. They used to be
  // React state only, so all 10,316 pages shared one URL: a page couldn't be linked or bookmarked,
  // the back button skipped the whole wall, and crawlers only ever saw the first 24 reviews.
  validateSearch: (s: Record<string, unknown>): ReviewsSearch => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    rating: [3, 4, 5].includes(Number(s["rating"])) ? Number(s["rating"]) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    try {
      return await getReviewsFn({ data: { page: deps.page ?? 1, minRating: deps.rating } });
    } catch {
      return {
        success: false,
        reviews: [],
        total: 0,
        page: 1,
        limit: 24,
        totalPages: 1,
        averageRating: 0,
        totalReviews: 0,
      };
    }
  },
  head: ({ match }) => {
    const { page, rating } = match.search as ReviewsSearch;
    const suffix = [rating ? `${rating}★ and up` : "", page ? `Page ${page}` : ""].filter(Boolean).join(" — ");
    return seo({
      title: `Patient Reviews & Stories${suffix ? ` — ${suffix}` : ""}`,
      description:
        "Read what patients say about doctors in the Go Surgery directory — ratings, treatments and cities — and share your own experience.",
      path: reviewsHref({}, { page, rating }),
    });
  },
  component: ReviewsPage,
});

function ReviewsPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const reviews = data?.reviews ?? [];
  const page = data?.page || 1;
  const minRating = search.rating ?? 0;
  const averageRating = data?.averageRating || 0;
  const totalReviews = data?.totalReviews || 0;
  const limit = data?.limit || 24;
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / limit));

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Reviews in our directory</Eyebrow>
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
              subtitle="Reviews held in our directory records for listed doctors. We're verifying where older reviews came from — any that fail our checks are held back, and very short reviews aren't shown."
              action={
                <a href="/reviews/write">
                  <OrangeButton>Write a Review</OrangeButton>
                </a>
              }
            />
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {ratingOptions.map((opt) => (
                <a
                  key={opt.value}
                  href={reviewsHref({}, { rating: opt.value || undefined })}
                  aria-current={minRating === opt.value ? "true" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    minRating === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-ink/70 hover:border-navy/30"
                  }`}
                >
                  {opt.label}
                </a>
              ))}
            </div>

            {reviews.length === 0 ? (
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

            <Pagination
              page={page}
              totalPages={totalPages}
              hrefFor={(p) => reviewsHref(search, { page: p })}
            />
            {totalPages > 1 && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Page {page.toLocaleString("en-IN")} of {totalPages.toLocaleString("en-IN")}
              </p>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
