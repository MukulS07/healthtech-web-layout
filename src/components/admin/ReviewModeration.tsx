import { useEffect, useState } from "react";
import { Check, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { getPendingReviewsFn, moderateReviewFn } from "@/lib/server-functions/reviews";

type Pending = Awaited<ReturnType<typeof getPendingReviewsFn>>["reviews"][number];

/** Admin queue for reviews submitted through /reviews/write — nothing is public until approved. */
export function ReviewModeration() {
  const [items, setItems] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPendingReviewsFn()
      .then((res) => (res.success ? setItems(res.reviews) : toast.error(res.error || "Could not load reviews")))
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
  if (!items.length) {
    return <p className="rounded-lg border border-border bg-white p-6 text-sm text-muted-foreground">No reviews waiting for moderation.</p>;
  }
  return (
    <div className="space-y-3">
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
