import { Phone, Star, ShieldCheck, HeartHandshake, CalendarCheck, Wallet, Stethoscope } from "lucide-react";
import { Container, OrangeButton, OutlineButton } from "./primitives";
import { ConsultForm } from "./ConsultForm";
import { ENABLED_PROMISES, telHref } from "@/lib/site";
import { roundDownPlus } from "@/lib/format";
import type { SiteStats } from "@/lib/server-functions/site-stats";

const promiseIcons: Record<string, typeof ShieldCheck> = {
  coordinator: HeartHandshake,
  "free-consult": CalendarCheck,
  insurance: ShieldCheck,
  emi: Wallet,
};

export function Hero({ stats }: { stats: SiteStats | null }) {
  return (
    <section id="top" className="bg-cream py-6 sm:py-10">
      <Container>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="flex min-w-0 flex-col justify-between rounded-xl bg-navy p-6 text-navy-foreground sm:p-8 lg:col-span-7 lg:p-10">
            <div>
              {stats && (stats.reviews > 0 || stats.surgeons > 0) ? (
                <div className="flex flex-wrap items-center gap-2">
                  {stats.averageRating && stats.reviews > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy shadow-sm">
                      <Star className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" /> {stats.averageRating}/5 from{" "}
                      {roundDownPlus(stats.reviews)} reviews in our directory
                    </span>
                  ) : null}
                  {stats.surgeons > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy shadow-sm">
                      <Stethoscope className="h-3.5 w-3.5 shrink-0 text-primary" /> {roundDownPlus(stats.surgeons)} surgeons listed
                    </span>
                  ) : null}
                </div>
              ) : null}

              <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Surgery, planned around <span className="text-brand-blue-light">you.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/80 sm:text-base">
                Tell us what's wrong. We'll help you understand your options, find an experienced
                surgeon near you, sort out insurance, and stay with you until you've recovered.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/specialities">
                <OrangeButton>Browse Specialities</OrangeButton>
              </a>
              <a href={telHref}>
                <OutlineButton tone="light" className="gap-2">
                  <Phone className="h-4 w-4 text-brand-orange" /> Call our care team
                </OutlineButton>
              </a>
            </div>

            {stats && stats.surgeons > 0 ? (
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-navy-foreground/15 pt-6 sm:gap-6">
                {[
                  { value: roundDownPlus(stats.surgeons), label: "Surgeons in directory" },
                  { value: roundDownPlus(stats.hospitals), label: "Hospitals listed" },
                  { value: String(stats.cities), label: "Cities covered" },
                ].map((stat) => (
                  <div key={stat.label} className="min-w-0">
                    <p className="text-xl font-bold text-brand-blue-light sm:text-2xl lg:text-3xl">{stat.value}</p>
                    <p className="mt-1 truncate text-xs text-navy-foreground/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div id="book" className="min-w-0 lg:col-span-5">
            <ConsultForm />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ENABLED_PROMISES.slice(0, 4).map((item) => {
            const Icon = promiseIcons[item.key] ?? ShieldCheck;
            return (
              <div
                key={item.key}
                className="flex min-w-0 items-center gap-3.5 rounded-xl border border-border/60 bg-background p-4 shadow-sm"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-orange-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">{item.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
