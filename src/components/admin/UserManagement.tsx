import { useEffect, useState } from "react";
import { RefreshCw, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { OutlineButton } from "@/components/home/primitives";
import { getAdminUsersFn, setUserStatusFn, type AdminUserFilters } from "@/lib/server-functions/admin-users";
import { AdminEmpty, AdminError, AdminLoading, AdminPanel, Pill, StatCard, inputClass, selectClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type UsersResult = Extract<Awaited<ReturnType<typeof getAdminUsersFn>>, { success: true }>;

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never";

/** Patient accounts: search, suspend, restore. */
export function UserManagement() {
  const [filters, setFilters] = useState<AdminUserFilters>({ status: "all", page: 1 });
  const [search, setSearch] = useState("");
  const [data, setData] = useState<UsersResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAdminUsersFn({ data: filters })
      .then((res) => {
        if (res.success) {
          setData(res);
          setError("");
        } else setError(res.error);
      })
      .catch(() => setError("Could not load patient accounts."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filters]);

  // Debounce typing into the query, so every keystroke isn't a database search.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, query: search || undefined, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleStatus = async (id: string, name: string, current: "active" | "suspended") => {
    const next = current === "active" ? "suspended" : "active";
    if (next === "suspended") {
      const reason = window.prompt(
        `Suspend ${name}?\n\nThey won't be able to log in and any session they have open ends immediately. Their bookings are kept and this can be undone.\n\nReason (optional, stored on the record):`,
        "",
      );
      // Cancel on the prompt means cancel the suspension.
      if (reason === null) return;
      setBusyId(id);
      const res = await setUserStatusFn({ data: { id, status: next, reason } });
      setBusyId(null);
      if (!res.success) {
      toast.error(res.error);
      return;
    }
      toast.success(`${name} suspended${res.sessionsRevoked ? ` — ${res.sessionsRevoked} session(s) ended` : ""}`);
      load();
      return;
    }
    setBusyId(id);
    const res = await setUserStatusFn({ data: { id, status: next } });
    setBusyId(null);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`${name} restored`);
    load();
  };

  return (
    <AdminPanel
      title="Patient accounts"
      description="Search, suspend and restore the people who've registered on the site."
      actions={
        <OutlineButton onClick={load} disabled={loading} className="py-2 text-xs">
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
        </OutlineButton>
      }
    >
      {error ? <AdminError>{error}</AdminError> : null}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active" value={data?.counts.active ?? 0} tone="good" />
        <StatCard label="Suspended" value={data?.counts.suspended ?? 0} tone={data?.counts.suspended ? "warning" : "default"} />
        <StatCard label="Total registered" value={data?.counts.all ?? 0} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3">
        <label className="relative flex-1 sm:min-w-[260px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Search patients</span>
          <input
            className={cn(inputClass, "pl-9")}
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Account status"
          className={selectClass}
          value={filters.status ?? "all"}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as AdminUserFilters["status"], page: 1 }))}
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="suspended">Suspended only</option>
        </select>
      </div>

      {loading && !data ? (
        <AdminLoading label="Loading patients…" />
      ) : !data?.users.length ? (
        <AdminEmpty>No accounts match that search.</AdminEmpty>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Bookings</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Last login</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy">{u.name}</p>
                      {u.role === "admin" ? (
                        <Pill tone="info">Admin{u.twoFactor ? " · 2FA" : " · 2FA not set up"}</Pill>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{u.email}</p>
                      <p>{u.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {u.status === "suspended" ? (
                        <>
                          <Pill tone="bad">Suspended</Pill>
                          {u.suspendedReason ? (
                            <p className="mt-1 max-w-[180px] text-[11px] text-muted-foreground">{u.suspendedReason}</p>
                          ) : null}
                        </>
                      ) : (
                        <Pill tone="good">Active</Pill>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{u.bookings}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{dateTime(u.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{dateTime(u.lastLoginAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => toggleStatus(u.id, u.name, u.status)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
                          u.status === "active"
                            ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                        )}
                      >
                        {u.status === "active" ? (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5" /> Suspend
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" /> Restore
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {data.page} of {data.totalPages} · {data.total.toLocaleString("en-IN")} accounts
              </span>
              <div className="flex gap-2">
                <OutlineButton
                  className="py-1.5 text-xs"
                  disabled={data.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: Math.max((f.page ?? 1) - 1, 1) }))}
                >
                  Previous
                </OutlineButton>
                <OutlineButton
                  className="py-1.5 text-xs"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                >
                  Next
                </OutlineButton>
              </div>
            </div>
          ) : null}
        </>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        There's no delete button here on purpose. A patient record is attached to their booking
        history, so removing it would orphan those records and lose the audit trail. Suspending
        blocks login and ends their sessions straight away, and one click puts it back.
      </p>
    </AdminPanel>
  );
}
