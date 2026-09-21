import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared furniture for the admin screens, so seven tabs don't drift into seven visual styles. */

export function AdminPanel({ title, description, actions, children }: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, change, tone = "default" }: {
  label: string;
  value: number | string;
  hint?: string;
  /** Percent change vs the previous period; null means we have no honest basis to state one. */
  change?: number | null;
  tone?: "default" | "warning" | "good";
}) {
  const formatted = typeof value === "number" ? value.toLocaleString("en-IN") : value;
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-2xs",
        tone === "warning" ? "border-amber-200 bg-amber-50/60" : tone === "good" ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-white",
      )}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-navy">{formatted}</p>
      {typeof change === "number" ? (
        <p className={cn("mt-1 text-[11px] font-semibold", change >= 0 ? "text-emerald-700" : "text-red-600")}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs the 30 days before
        </p>
      ) : null}
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-12 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" /> {label}
    </div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">{children}</p>
  );
}

export function AdminError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{children}</p>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary";

export const selectClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary";

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "good" | "warning" | "bad" | "info" }) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    good: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    bad: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-800",
  } as const;
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", tones[tone])}>{children}</span>;
}

/** Bar chart for daily/monthly counts. Deliberately plain: no library, no axis fiction. */
export function BarChart({ data, emptyLabel }: { data: { label: string; value: number; title?: string }[]; emptyLabel: string }) {
  const max = Math.max(...data.map((d) => d.value), 0);
  if (max === 0) {
    return <p className="py-10 text-center text-xs text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={d.title ?? `${d.label}: ${d.value}`}>
          <div
            className="w-full rounded-t bg-primary/80"
            style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%` }}
          />
          <span className="w-full truncate text-center text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
