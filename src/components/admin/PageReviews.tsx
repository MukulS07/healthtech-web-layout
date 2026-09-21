import { useEffect, useState } from "react";
import { Check, EyeOff, MapPin, Pin, PinOff, RotateCcw, Search, Star, Stethoscope, X } from "lucide-react";
import { toast } from "sonner";
import { OutlineButton } from "@/components/home/primitives";
import {
  getAdminReviewsFn,
  moderateReviewFn,
  pinReviewFn,
  setReviewVisibilityFn,
  type AdminReviewTab,
} from "@/lib/server-functions/reviews";
import { AdminEmpty, AdminError, AdminLoading, AdminPanel, Pill, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Result = Extract<Awaited<ReturnType<typeof getAdminReviewsFn>>, { success: true }>;

const FLAG_LABELS: Record<string, string> = {
  "blank-doctor-name": "doctor's name missing from the text",
  "duplicate-text": "same text as other reviews",
  "non-standard-rating": "rating isn't a whole 1–5 star value",
  gibberish: "text is keyboard mash, not a real review",
};

const TABS: { id: AdminReviewTab; label: string }[] = [
  { id: "all", label: "All reviews" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Published" },
  { id: "pinned", label: "Pinned" },
  { id: "flagged", label: "Held back" },
];

/** Moderate the review wall: approve submissions, pin the best, hide what shouldn't be public. */
export function PageReviews() {
  const [tab, setTab] = useState<AdminReviewTab>("pending");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAdminReviewsFn({ data: { tab, page, ...(query ? { query } : {}) } })
      .then((res) => {
        if (res.success) {
          setData(res);
          setError("");
        } else setError(res.error);
      })
      .catch(() => setError("Could not load reviews."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [tab, page, query]);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const act = async (id: string, fn: () => Promise<{ success: boolean; error?: string }>, okMessage: string) => {
    setBusy(id);
    const res = await fn();
    setBusy(null);
    if (!res.success) {
      toast.error(res.error || "That didn't work.");
      return;
    }
    toast.success(okMessage);
    load();
  };

  return (
    <AdminPanel
      title="Reviews"
      description="Everything patients see on the review wall, plus what's waiting on a decision."
    >
      {error ? <AdminError>{error}</AdminError> : null}

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1">
        {TABS.map((t) => {
          const badge =
            t.id === "pending" ? data?.counts.pending : t.id === "pinned" ? data?.counts.pinned : t.id === "flagged" ? data?.counts.flagged : undefined;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:text-navy",
              )}
            >
              {t.label}
              {badge !== undefined ? (
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", tab === t.id ? "bg-white/20" : "bg-muted")}>
                  {badge.toLocaleString("en-IN")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "flagged" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          <p className="font-semibold">Imported reviews held back — hidden from patients, not deleted.</p>
          <p className="mt-1">
            These were flagged by <code>scripts/flag-reviews.ts</code> as showing signs of template
            generation (a blank doctor-name slot, text repeated word for word, unusual ratings, or
            keyboard mash). Restore the whole set with <code>npx tsx scripts/flag-reviews.ts --undo</code>,
            or publish individual ones below if you've checked them.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-white p-3">
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Search reviews</span>
          <input
            className={cn(inputClass, "pl-9")}
            placeholder="Search by patient name, city or wording…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading && !data ? (
        <AdminLoading label="Loading reviews…" />
      ) : !data?.reviews.length ? (
        <AdminEmpty>Nothing in this tab.</AdminEmpty>
      ) : (
        <>
          <ul className="space-y-2">
            {data.reviews.map((r) => {
              const isPending = r.status === "pending";
              const isHidden = r.status === "rejected";
              return (
                <li key={r.id} className="rounded-xl border border-border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-navy">{r.patientName}</p>
                        <span className="flex items-center gap-1 text-xs font-bold text-navy">
                          <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {r.rating}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/80">{r.comment}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {r.doctorName ? (
                          <Pill tone="info">
                            <Stethoscope className="mr-1 inline h-3 w-3" />
                            {r.doctorName}
                          </Pill>
                        ) : null}
                        {r.speciality ? <Pill>{r.speciality}</Pill> : null}
                        {r.city ? (
                          <Pill>
                            <MapPin className="mr-1 inline h-3 w-3" />
                            {r.city}
                          </Pill>
                        ) : null}
                        {r.pinned ? <Pill tone="warning">Pinned</Pill> : null}
                        {isPending ? <Pill tone="warning">Pending</Pill> : null}
                        {isHidden ? <Pill tone="bad">Hidden</Pill> : null}
                        {r.flagReason.map((f) => (
                          <Pill key={f} tone="bad">
                            {FLAG_LABELS[f] ?? f}
                          </Pill>
                        ))}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      {isPending && !r.flagReason.length ? (
                        <>
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={() => act(r.id, () => moderateReviewFn({ data: { id: r.id, decision: "approved" } }), "Review published")}
                            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={busy === r.id}
                            onClick={() => act(r.id, () => moderateReviewFn({ data: { id: r.id, decision: "rejected" } }), "Review rejected")}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <OutlineButton
                            className="px-2 py-1.5 text-xs"
                            disabled={busy === r.id}
                            onClick={() => act(r.id, () => pinReviewFn({ data: { id: r.id, pinned: !r.pinned } }), r.pinned ? "Unpinned" : "Pinned to the top of the wall")}
                          >
                            {r.pinned ? (
                              <>
                                <PinOff className="mr-1 h-3 w-3" /> Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="mr-1 h-3 w-3" /> Pin
                              </>
                            )}
                          </OutlineButton>
                          <OutlineButton
                            className="px-2 py-1.5 text-xs"
                            disabled={busy === r.id}
                            onClick={() =>
                              act(
                                r.id,
                                () => setReviewVisibilityFn({ data: { id: r.id, visible: isHidden } }),
                                isHidden ? "Back on the review wall" : "Hidden from patients",
                              )
                            }
                          >
                            {isHidden ? (
                              <>
                                <RotateCcw className="mr-1 h-3 w-3" /> Restore
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-1 h-3 w-3" /> Hide
                              </>
                            )}
                          </OutlineButton>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {data.page} of {data.totalPages.toLocaleString("en-IN")} · {data.total.toLocaleString("en-IN")} reviews
              </span>
              <div className="flex gap-2">
                <OutlineButton className="py-1.5 text-xs" disabled={data.page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                  Previous
                </OutlineButton>
                <OutlineButton className="py-1.5 text-xs" disabled={data.page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </OutlineButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Hiding a review takes it off the site and can be undone; nothing here deletes a patient's
        words. Pinned reviews lead the public wall, so pin ones that are genuinely representative —
        a wall of nothing but pinned five-star reviews is the kind of thing patients notice.
      </p>
    </AdminPanel>
  );
}
