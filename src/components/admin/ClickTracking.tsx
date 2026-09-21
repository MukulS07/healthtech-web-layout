import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OutlineButton } from "@/components/home/primitives";
import { exportClicksCsvFn, getClickAnalyticsFn, type ClickFilters } from "@/lib/server-functions/analytics";
import { AdminEmpty, AdminError, AdminLoading, AdminPanel, BarChart, Pill, StatCard, selectClass, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Analytics = Extract<Awaited<ReturnType<typeof getClickAnalyticsFn>>, { success: true }>;

const TYPE_LABELS: Record<string, string> = {
  call: "Call",
  whatsapp: "WhatsApp",
  profile_click: "Profile view",
  directions: "Directions",
  enquiry: "Enquiry",
};

const TYPE_TONES: Record<string, "good" | "info" | "muted" | "warning"> = {
  call: "info",
  whatsapp: "good",
  profile_click: "muted",
  directions: "muted",
  enquiry: "warning",
};

/** Who patients are contacting, through which channel, from which listing. */
export function ClickTracking() {
  const [filters, setFilters] = useState<ClickFilters>({});
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = (next: ClickFilters) => {
    setLoading(true);
    getClickAnalyticsFn({ data: next })
      .then((res) => {
        if (res.success) {
          setData(res);
          setError("");
        } else setError(res.error);
      })
      .catch(() => setError("Could not load the tracking report."))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(filters), [filters]);

  const update = (patch: Partial<ClickFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await exportClicksCsvFn({ data: filters });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      // Built in the browser from the string the server returned — no file is written server-side.
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `go-surgery-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${res.rows.toLocaleString("en-IN")} interactions`);
    } catch {
      toast.error("Could not export the report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminPanel
      title="Call & WhatsApp tracking"
      description="Every call, WhatsApp message, profile view and enquiry from the public site."
      actions={
        <>
          <OutlineButton onClick={() => load(filters)} disabled={loading} className="py-2 text-xs">
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </OutlineButton>
          <OutlineButton onClick={exportCsv} disabled={exporting || !data} className="py-2 text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> {exporting ? "Exporting…" : "Export CSV"}
          </OutlineButton>
        </>
      }
    >
      {error ? <AdminError>{error}</AdminError> : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total interactions" value={data?.totals.total ?? 0} />
        <StatCard label="Call clicks" value={data?.totals.call ?? 0} />
        <StatCard label="WhatsApp clicks" value={data?.totals.whatsapp ?? 0} />
        <StatCard label="Enquiries submitted" value={data?.totals.enquiries ?? 0} />
        <StatCard label="Unique visitors" value={data?.totals.uniqueVisitors ?? 0} hint="Browsers, not people" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <label className="text-xs font-medium text-muted-foreground">
          From
          <input
            type="date"
            className={cn(inputClass, "ml-2 w-auto")}
            value={filters.from ?? ""}
            onChange={(e) => update({ from: e.target.value || undefined })}
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          To
          <input
            type="date"
            className={cn(inputClass, "ml-2 w-auto")}
            value={filters.to ?? ""}
            onChange={(e) => update({ to: e.target.value || undefined })}
          />
        </label>
        <select
          aria-label="City"
          className={selectClass}
          value={filters.city ?? ""}
          onChange={(e) => update({ city: e.target.value || undefined })}
        >
          <option value="">All cities</option>
          {data?.cities.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count.toLocaleString("en-IN")})
            </option>
          ))}
        </select>
        <select
          aria-label="Interaction type"
          className={selectClass}
          value={filters.type ?? ""}
          onChange={(e) => update({ type: e.target.value || undefined })}
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Listing type"
          className={selectClass}
          value={filters.targetType ?? ""}
          onChange={(e) => update({ targetType: e.target.value || undefined })}
        >
          <option value="">Doctors & hospitals</option>
          <option value="doctor">Doctors only</option>
          <option value="hospital">Hospitals only</option>
          <option value="site">Site-wide numbers</option>
        </select>
        {Object.values(filters).some(Boolean) ? (
          <button type="button" onClick={() => setFilters({})} className="text-xs font-semibold text-primary hover:underline">
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Last 30 days</p>
        <BarChart
          data={(data?.trend ?? []).map((t) => ({
            label: t.date.slice(5),
            value: t.total,
            title: `${t.date}: ${t.total} interactions (${t.call} calls, ${t.whatsapp} WhatsApp)`,
          }))}
          emptyLabel="No interactions recorded in this window yet."
        />
      </div>

      {loading && !data ? (
        <AdminLoading label="Loading interactions…" />
      ) : !data?.rows.length ? (
        <AdminEmpty>
          Nothing recorded yet. Tracking starts from the moment this was switched on — it can't show
          calls made before that, because nothing was counting them.
        </AdminEmpty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Last interaction</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3 text-right">Times</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.rows.map((r, i) => (
                <tr key={`${r.targetId ?? r.targetName}-${r.type}-${i}`} className="transition-colors hover:bg-muted/20">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(r.lastClick).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={TYPE_TONES[r.type] ?? "muted"}>{TYPE_LABELS[r.type] ?? r.type}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{r.targetName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.targetType}
                      {r.targetPhone ? ` · ${r.targetPhone}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.city || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.isGuest ? "Guest" : "Signed in"}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{r.clicks}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        We record the listing, channel, city and page — never an IP address, a browser fingerprint or
        the content of any call or message. "Unique visitors" counts browsers, not people: the same
        person on a phone and a laptop counts twice, and clearing site data starts a new count.
      </p>
    </AdminPanel>
  );
}
