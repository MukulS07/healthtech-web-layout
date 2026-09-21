import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { OutlineButton } from "@/components/home/primitives";
import { getAdminOverviewFn } from "@/lib/server-functions/admin-stats";
import { AdminError, AdminLoading, AdminPanel, StatCard } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Overview = Extract<Awaited<ReturnType<typeof getAdminOverviewFn>>, { success: true }>;

/** Platform-wide counts, plus the queues that actually need someone's attention today. */
export function DashboardOverview({ onOpenTab }: { onOpenTab?: (tab: string) => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAdminOverviewFn()
      .then((res) => {
        if (res.success) {
          setData(res);
          setError("");
        } else setError(res.error);
      })
      .catch(() => setError("Could not load the dashboard."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading && !data) return <AdminLoading label="Loading dashboard…" />;
  if (error) return <AdminError>{error}</AdminError>;
  if (!data) return null;

  const outstanding = data.actionQueue.filter((q) => q.count > 0);

  return (
    <AdminPanel
      title="Overview"
      description={`Last updated ${new Date(data.generatedAt).toLocaleTimeString("en-IN")}`}
      actions={
        <OutlineButton onClick={load} disabled={loading} className="py-2 text-xs">
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
        </OutlineButton>
      }
    >
      {outstanding.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Needs attention</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {outstanding.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => onOpenTab?.(q.key)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                {q.count.toLocaleString("en-IN")} · {q.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm font-medium text-emerald-800">
          Nothing is waiting — no unanswered bookings, reviews, questions or insurance checks.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.cards.map((c) => (
          <StatCard key={c.key} label={c.label} value={c.value} hint={c.hint} change={c.change} />
        ))}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        A month-on-month figure is only shown where this site wrote the records itself and their dates
        mean something — patients, bookings, reviews and tracked clicks. Doctors and hospitals were
        bulk-imported, so their timestamps say when the import ran, not when anything happened; a
        percentage off those would be a number we invented.
      </p>
    </AdminPanel>
  );
}
