import { useMemo, useState } from "react";
import { IndianRupee } from "lucide-react";
import { OutlineButton } from "@/components/home/primitives";
import { formatRupees } from "@/data/cost";
import { cn } from "@/lib/utils";
import { A } from "@/components/common/A";

/**
 * Plain EMI arithmetic on numbers the patient types in — no price data of ours involved, so
 * nothing here is an estimate of what any treatment costs. Standard reducing-balance formula:
 *   EMI = P·r·(1+r)^n / ((1+r)^n − 1),  r = annual rate / 12 / 100
 * At 0% ("no-cost" EMI) that collapses to P/n, so it's handled separately.
 */
export function emi(principal: number, annualRatePercent: number, months: number) {
  if (principal <= 0 || months <= 0) return { monthly: 0, total: 0, interest: 0 };
  const r = annualRatePercent / 12 / 100;
  const monthly = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const total = monthly * months;
  return { monthly, total, interest: total - principal };
}

const TENURES = [3, 6, 9, 12, 18, 24, 36];

export function EmiCalculator({ className }: { className?: string }) {
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(14);
  const [noCost, setNoCost] = useState(false);

  const effectiveRate = noCost ? 0 : rate;
  const result = useMemo(() => emi(amount, effectiveRate, months), [amount, effectiveRate, months]);

  return (
    <div className={cn("rounded-2xl border border-border bg-background p-5 shadow-sm sm:p-6", className)}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 space-y-5">
          <div>
            <label htmlFor="emi-amount" className="flex items-center justify-between text-sm font-semibold text-navy">
              Treatment amount
              <span className="text-base font-bold text-primary">{formatRupees(amount)}</span>
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-cream px-3 py-2">
              <IndianRupee className="h-4 w-4 shrink-0 text-brand-orange" />
              <input
                id="emi-amount"
                type="number"
                min={5000}
                max={5000000}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full min-w-0 bg-transparent text-sm text-ink outline-none"
              />
            </div>
            <input
              aria-label="Treatment amount slider"
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={Math.min(amount, 1000000)}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
          </div>

          <div>
            <span className="text-sm font-semibold text-navy">Repayment period</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TENURES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  aria-pressed={months === m}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    months === m ? "border-primary bg-primary text-white" : "border-border bg-cream text-navy hover:border-primary/40",
                  )}
                >
                  {m} months
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="emi-rate" className="flex items-center justify-between text-sm font-semibold text-navy">
              Interest rate (per year)
              <span className={cn("text-base font-bold", noCost ? "text-muted-foreground line-through" : "text-primary")}>{rate}%</span>
            </label>
            <input
              id="emi-rate"
              type="range"
              min={0}
              max={36}
              step={0.5}
              value={rate}
              disabled={noCost}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-3 w-full accent-primary disabled:opacity-40"
            />
            <label className="mt-3 flex items-start gap-2 text-sm text-ink/85">
              <input type="checkbox" checked={noCost} onChange={(e) => setNoCost(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                No-cost EMI (0% interest)
                <span className="block text-xs text-muted-foreground">
                  Ask the lender what it costs: many “no-cost” plans add a processing fee, or the
                  interest is taken off the price as a discount instead.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-navy p-5 text-navy-foreground">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-foreground/70">Monthly instalment</p>
          <p className="mt-1 text-3xl font-bold text-brand-orange">{formatRupees(Math.round(result.monthly))}</p>
          <p className="mt-1 text-xs text-navy-foreground/70">for {months} months</p>

          <dl className="mt-5 space-y-2.5 border-t border-navy-foreground/15 pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-navy-foreground/75">Amount financed</dt>
              <dd className="font-semibold">{formatRupees(amount)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-navy-foreground/75">Interest payable</dt>
              <dd className="font-semibold">{formatRupees(Math.round(result.interest))}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-navy-foreground/15 pt-2.5">
              <dt className="text-navy-foreground/75">Total you repay</dt>
              <dd className="text-base font-bold">{formatRupees(Math.round(result.total))}</dd>
            </div>
          </dl>

          <p className="mt-4 text-[11px] leading-relaxed text-navy-foreground/60">
            An illustration using the figures you entered, not an offer. Your actual instalment
            depends on the lender's rate, processing fee and their credit check.
          </p>
          <A href="/contact" className="mt-4 inline-block">
            <OutlineButton tone="light" className="px-4 py-2 text-sm">Ask about payment options</OutlineButton>
          </A>
        </div>
      </div>
    </div>
  );
}
