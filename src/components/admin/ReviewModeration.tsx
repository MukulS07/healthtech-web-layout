import { useEffect, useState } from "react";
import { Check, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { getPendingReviewsFn, moderateReviewFn } from "@/lib/server-functions/reviews";

type Pending = Awaited<ReturnType<typeof getPendingReviewsFn>>["reviews"][number];
type Flagged = { reason: string; count: number };

const FLAG_LABELS: Record<string, string> = {
  "blank-doctor-name": "doctor's name missing from the text",
  "duplicate-text": "same text as other reviews",
  "non-standard-rating": "rating isn't a whole 1–5 star value",
};

/** Admin queue for reviews submitted through /reviews/write — nothing is public until approved. */
export function ReviewModeration() {
  const [items, setItems] = useState<Pending[]>([]);
  const [flagged, setFlagged] = useState<Flagged[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPendingReviewsFn()
      .then((res) => {
        if (!res.success) {
          toast.error(res.error || "Could not load reviews");
          return;
        }
        setItems(res.reviews);
        setFlagged(res.flagged);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    const res = await moderateReviewFn({ data: { id, decision } });
    if (res.success) {
      setItems((prev) => prev.filter((r) => r.id !== id));
      toast.success(decision === "approved" ? "Review published" : "Review rejected");
    } else toast.error(res.error || "Could not update review");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  const flaggedNote = flagged.length ? (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
      <p className="font-semibold">Imported reviews held back (not shown publicly, not deleted)</p>
      <ul className="mt-1 list-disc pl-5">
        {flagged.map((f) => (
          <li key={f.reason}>
            {f.count.toLocaleString("en-IN")} — {FLAG_LABELS[f.reason] || f.reason}
          </li>
        ))}
      </ul>
      <p className="mt-1">A review can have more than one reason. Restore them with <code>npx tsx scripts/flag-reviews.ts --undo</code>.</p>
    </div>
  ) : null;

  if (!items.length) {
    return (
      <div className="space-y-3">
        {flaggedNote}
        <p className="rounded-lg border border-border bg-white p-6 text-sm text-muted-foreground">No website reviews waiting for moderation.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {flaggedNote}
      {items.map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-navy">
              {r.patientName} → {r.doctorName || "Unknown doctor"}
            </p>
            <span className="flex items-center gap-1 text-xs font-bold text-navy">
              <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {r.rating}
              <span className="ml-2 font-normal text-muted-foreground">{new Date(r.createdAt).toLocaleString("en-IN")}</span>
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{r.comment}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide(r.id, "approved")} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white">
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button type="button" onClick={() => decide(r.id, "rejected")} className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
