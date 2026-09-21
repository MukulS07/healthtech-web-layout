import { useState, type ReactNode } from "react";
import { ChevronDown, FileCheck2, HeartHandshake, Info, ShieldCheck, Stethoscope, Wallet } from "lucide-react";
import { OrangeButton, OutlineButton } from "@/components/home/primitives";
import { CALLER, cap, ENABLED_PROMISES } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Faq } from "@/data/catalog";
import type { ClinicalReview } from "@/data/catalog/types";
import { A } from "@/components/common/A";
import { useT } from "@/lib/i18n/context";
import { WithLink } from "@/lib/i18n/rich";

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  const t = useT();
  return (
    <nav aria-label={t("blk.breadcrumb")} className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center gap-2 px-4 sm:px-6 lg:px-8">
        {items.map((it, i) => (
          <span key={it.name} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {it.href ? (
              <A href={it.href} className="hover:text-brand-orange">{it.name}</A>
            ) : (
              <span className="font-medium text-ink" aria-current="page">{it.name}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}

export function FaqList({ faqs, defaultOpen = 0 }: { faqs: Faq[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-2.5">
      {faqs.map((f, i) => (
        <div key={f.q} className="overflow-hidden rounded-xl border border-border/80 bg-cream/70">
          <button
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left"
          >
            <h3 className="text-sm font-semibold text-navy">{f.q}</h3>
            <ChevronDown className={cn("h-5 w-5 shrink-0 text-brand-orange transition-transform", open === i && "rotate-180")} />
          </button>
          {/* Answers stay in the DOM (hidden) so they're crawlable and match the FAQPage schema. */}
          <p hidden={open !== i} className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
            {f.a}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Intro paragraph always visible; extra paragraphs behind "Read more" (still in the DOM for SEO). */
export function ReadMore({ intro, more }: { intro: string; more: string[] }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="text-sm leading-relaxed text-ink/85 sm:text-base">
      <p>{intro}</p>
      {more.length ? (
        <>
          <div hidden={!expanded} className="mt-3 space-y-3">
            {more.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <button type="button" onClick={() => setExpanded(!expanded)} className="mt-3 text-sm font-semibold text-primary hover:underline">
            {expanded ? t("blk.readLess") : t("blk.readMore")}
          </button>
        </>
      ) : null}
    </div>
  );
}

export function WhyChooseUs({ specialityName }: { specialityName: string }) {
  const blocks = [
    { icon: Stethoscope, title: "Expert consultation", text: `Get your ${specialityName.toLowerCase()} problem assessed by an experienced surgeon, who explains every option — including not operating.` },
    { icon: FileCheck2, title: "Modern techniques", text: "Where suitable, minimally invasive and laser procedures that mean smaller wounds and a quicker recovery." },
    { icon: HeartHandshake, title: "Guided surgery journey", text: `${cap(CALLER)} helps with scheduling, admission steps and paperwork so you're not left to figure it out.` },
    { icon: ShieldCheck, title: "Support through recovery", text: "Clear recovery instructions and help arranging your follow-up review with the surgeon." },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {blocks.map((b) => (
        <div key={b.title} className="rounded-xl border border-border bg-background p-5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-orange-soft text-primary">
            <b.icon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-bold text-navy">{b.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
        </div>
      ))}
    </div>
  );
}

export function BenefitsStrip() {
  if (!ENABLED_PROMISES.length) return null;
  return (
    <ul className="grid gap-3 rounded-xl bg-navy p-5 text-navy-foreground sm:grid-cols-2">
      {ENABLED_PROMISES.map((p) => (
        <li key={p.key} className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
          <span>
            <span className="block text-sm font-semibold">{p.title}</span>
            <span className="text-xs text-navy-foreground/70">{p.sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function InsuranceEmiBlock() {
  const t = useT();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-cream p-5">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h3 className="mt-3 text-base font-bold text-navy">{t("blk.insTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("blk.insBody")}
        </p>
        <A href="/insurance-eligibility" className="mt-4 inline-block">
          <OrangeButton className="px-4 py-2 text-sm">{t("home.insCheck")}</OrangeButton>
        </A>
      </div>
      <div className="rounded-xl border border-border bg-cream p-5">
        <Wallet className="h-6 w-6 text-primary" />
        <h3 className="mt-3 text-base font-bold text-navy">{t("blk.emiTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("blk.emiBody")}
        </p>
        <A href="/emi-calculator" className="mt-4 inline-block">
          <OutlineButton className="px-4 py-2 text-sm">{t("blk.emiBtn")}</OutlineButton>
        </A>
      </div>
    </div>
  );
}

/**
 * Who wrote the page and whether a clinician has reviewed it. Shows "Pending medical review" until
 * the catalog entry has a real `reviewedBy` — never implies a review that hasn't happened.
 */
export function ContentReviewNote({ reviewedBy, tone = "dark" }: { reviewedBy?: ClinicalReview | undefined; tone?: "dark" | "light" }) {
  const t = useT();
  const base = tone === "dark" ? "bg-white/10 text-navy-foreground/85" : "bg-cream text-muted-foreground border border-border";
  return (
    <p className={cn("mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-3 py-2 text-xs", base)}>
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>{t("blk.writtenBy")}</span>
      <span aria-hidden>·</span>
      {reviewedBy ? (
        <span>
          <WithLink
            text={t("blk.reviewedBy", {
              credentials: reviewedBy.credentials,
              date: new Date(reviewedBy.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
            })}
            link={
              reviewedBy.profileSlug ? (
                <A href={`/doctors/${reviewedBy.profileSlug}`} className="font-semibold underline">{reviewedBy.name}</A>
              ) : (
                <span className="font-semibold">{reviewedBy.name}</span>
              )
            }
          />
        </span>
      ) : (
        <span className="font-semibold">{t("blk.pendingReview")}</span>
      )}
      <A href="/editorial-policy" className="underline">{t("blk.howWrite")}</A>
    </p>
  );
}

export function MedicalDisclaimer() {
  const t = useT();
  return (
    <p className="flex items-start gap-2 rounded-lg border border-border bg-cream p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <WithLink text={t("blk.disclaimer")} link={<A href="/editorial-policy" className="underline">{t("blk.howWrite")}</A>} />
      </span>
    </p>
  );
}

export function Section({ id, title, eyebrow, children, action }: { id?: string; title: ReactNode; eyebrow?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-40">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">{eyebrow}</p> : null}
          <h2 className="mt-1 text-xl font-bold text-navy sm:text-2xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
