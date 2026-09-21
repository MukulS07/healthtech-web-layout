import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { getDoctorAnalyticsFn } from "@/lib/server-functions/analytics";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { AdminEmpty, AdminLoading, AdminPanel, BarChart, Pill, StatCard, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Analytics = Extract<Awaited<ReturnType<typeof getDoctorAnalyticsFn>>, { success: true }>;
type Candidate = { id: string; name: string; specialty: string; city: string };

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "1 year" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * What one doctor's listing is actually doing: views, calls, WhatsApp, enquiries, and how complete
 * their profile is. This is the admin's view of a doctor — there is no doctor login on this site.
 */
export function DoctorAnalytics() {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setCandidates([]);
      return;
    }
    const t = setTimeout(() => {
      setSearching(true);
      getDoctorsFn({ data: { query: term, limit: 12, scope: "all" } })
        .then((res) => {
          if (res.success) {
            setCandidates(res.doctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty, city: d.city })));
          }
        })
        .catch(() => undefined)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    getDoctorAnalyticsFn({ data: { doctorId: selected, days } })
      .then((res) => {
        if (res.success) setData(res);
        else {
          toast.error(res.error);
          setData(null);
        }
      })
      .catch(() => toast.error("Could not load this doctor's figures."))
      .finally(() => setLoading(false));
  }, [selected, days]);

  return (
    <AdminPanel
      title="Doctor performance"
      description="Per-listing views, calls, WhatsApp messages and enquiries."
    >
      <div className="rounded-xl border border-border bg-white p-3">
        <label className="relative block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Search doctors</span>
          <input
            className={cn(inputClass, "pl-9")}
            placeholder="Search for a doctor by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {searching ? <p className="mt-2 text-xs text-muted-foreground">Searching…</p> : null}
        {candidates.length ? (
          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                    selected === c.id ? "bg-primary/10 font-semibold text-primary" : "text-navy",
                  )}
                >
                  {c.name}
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {[c.specialty, c.city].filter(Boolean).join(" · ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {!selected ? (
        <AdminEmpty>Search for a doctor to see how their listing is performing.</AdminEmpty>
      ) : loading && !data ? (
        <AdminLoading label="Loading figures…" />
      ) : !data ? (
        <AdminEmpty>No figures for this doctor.</AdminEmpty>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4">
            <div>
              <p className="text-base font-bold text-navy">{data.doctor.name}</p>
              <p className="text-xs text-muted-foreground">
                {[data.doctor.specialization, data.doctor.city].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-1 rounded-lg border border-border p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  onClick={() => setDays(r.days)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                    days === r.days ? "bg-navy text-white" : "text-muted-foreground hover:text-navy",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Profile views" value={data.stats.profileClicks} change={data.stats.profileClicksChange} />
            <StatCard label="Call clicks" value={data.stats.call} />
            <StatCard label="WhatsApp clicks" value={data.stats.whatsapp} />
            <StatCard label="Directions" value={data.stats.directions} />
            <StatCard
              label="Enquiries"
              value={data.stats.enquiries}
              tone={data.stats.enquiries > 0 ? "good" : "default"}
              hint="Bookings assigned to them"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Interactions, last 6 months
              </p>
              <BarChart
                data={data.monthly.map((m) => {
                  const monthIndex = Number(m.month.slice(5, 7)) - 1;
                  return { label: MONTHS[monthIndex] ?? m.month, value: m.total };
                })}
                emptyLabel="No interactions recorded for this doctor yet."
              />
            </div>

            <div className="rounded-xl border border-border bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Profile completeness</p>
              <p className="mt-2 text-3xl font-extrabold text-navy">{data.profileScore}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${data.profileScore}%` }} />
              </div>
              {data.missingFields.length ? (
                <>
                  <p className="mt-3 text-[11px] font-semibold text-muted-foreground">Missing from their profile:</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {data.missingFields.map((f) => (
                      <Pill key={f} tone="warning">
                        {f}
                      </Pill>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[11px] text-emerald-700">Every field patients look for is filled in.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent enquiries</p>
            {!data.recentEnquiries.length ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No bookings have been assigned to this doctor yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recentEnquiries.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">{e.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {[e.treatment, e.city].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill tone={e.status === "completed" ? "good" : e.status === "pending" ? "warning" : "info"}>
                        {e.status}
                      </Pill>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            These counts start from when tracking was switched on, so a doctor listed for years will
            still show a low total at first. A change figure only appears once there's an earlier
            period to compare with.
          </p>
        </>
      )}
    </AdminPanel>
  );
}
