import { CalendarCheck, HeartPulse, Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "./primitives";
import { BOOK_LABEL, TOP_CITIES, promiseEnabled, SITE, telHref, whatsappHref } from "@/lib/site";
import { SPECIALITIES } from "@/data/catalog";
import { A } from "@/components/common/A";
import { track } from "@/lib/track";
import { useT } from "@/lib/i18n/context";
import type { TVars } from "@/lib/i18n/types";

type T = (key: string, vars?: TVars) => string;

// Speciality and treatment names are catalogue terms and stay English (see i18n/strings.ts); the
// column titles and generic links are interface text and are translated.
const buildColumns = (t: T) => [
  {
    title: t("nav.specialities"),
    links: [
      ...SPECIALITIES.slice(0, 8).map((s) => ({ label: s.name, href: `/specialities/${s.slug}` })),
      { label: t("footer.allSpecialities", { n: SPECIALITIES.length }), href: "/specialities" },
    ],
  },
  {
    title: t("footer.colTreatments"),
    links: [
      { label: "Laser Piles Surgery", href: "/treatments/laser-piles-surgery" },
      { label: "Gallbladder Removal", href: "/treatments/laparoscopic-cholecystectomy" },
      { label: "Hernia Repair", href: "/treatments/laparoscopic-hernia-repair" },
      { label: "Kidney Stone (RIRS)", href: "/treatments/rirs" },
      { label: "Cataract Surgery", href: "/treatments/phaco-cataract-surgery" },
      { label: "Knee Replacement", href: "/treatments/total-knee-replacement" },
      { label: t("footer.allTreatments"), href: "/treatments" },
      { label: t("footer.allConditions"), href: "/conditions" },
    ],
  },
  {
    title: t("nav.forPatients"),
    links: [
      { label: promiseEnabled("free-consult") ? BOOK_LABEL : t("action.book"), href: "/contact" },
      { label: t("footer.findDoctors"), href: "/doctors" },
      { label: t("footer.findHospitals"), href: "/hospitals" },
      { label: t("footer.askQuestion"), href: "/ask-a-question" },
      { label: t("nav.reviews"), href: "/reviews" },
      { label: t("action.writeReview"), href: "/reviews/write" },
      { label: t("footer.treatmentCost"), href: "/cost" },
      { label: t("footer.noCostEmi"), href: "/no-cost-emi" },
      { label: t("footer.insuranceElig"), href: "/insurance-eligibility" },
      { label: t("footer.costCalc"), href: "/surgery-cost-calculator" },
      { label: t("footer.emiCalc"), href: "/emi-calculator" },
      { label: t("footer.dueDate"), href: "/pregnancy-due-date-calculator" },
      { label: t("footer.patientHelp"), href: "/patient-help" },
      { label: t("nav.faqs"), href: "/faqs" },
    ],
  },
  {
    title: t("footer.colCompany"),
    links: [
      { label: t("nav.about"), href: "/about" },
      { label: t("footer.healthfeed"), href: "/blog" },
      { label: t("nav.careers"), href: "/careers" },
      { label: t("footer.partner"), href: "/doctor-onboarding" },
      { label: t("nav.contact"), href: "/contact" },
      { label: t("nav.locations"), href: "/locations" },
      { label: t("footer.editorial"), href: "/editorial-policy" },
      { label: t("footer.privacy"), href: "/privacy" },
      { label: t("footer.terms"), href: "/terms" },
    ],
  },
];

export function Footer() {
  const t = useT();
  const columns = buildColumns(t);
  return (
    <>
      <footer className="bg-navy pb-10 pt-14 text-navy-foreground">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:gap-10">
            <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold tracking-tight">{SITE.name}</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-foreground/75">
                {t("footer.about")}
              </p>
              <div className="mt-4 space-y-2 text-sm font-semibold">
                <A href={telHref} className="flex items-center gap-2 hover:text-brand-orange" onClick={() => track({ type: "call", targetType: "site", targetName: "Care team" })}>
                  <Phone className="h-4 w-4 shrink-0 text-brand-orange" /> {SITE.phone.display}
                </A>
                <A href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-orange" onClick={() => track({ type: "whatsapp", targetType: "site", targetName: "Care team" })}>
                  <MessageCircle className="h-4 w-4 shrink-0 text-brand-orange" /> {t("footer.whatsappUs")}
                </A>
                <A href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-brand-orange">
                  <Mail className="h-4 w-4 shrink-0 text-brand-orange" /> {SITE.email}
                </A>
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-bold tracking-wide text-navy-foreground">{col.title}</p>
                <ul className="mt-3.5 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <A href={l.href} className="rounded text-sm text-navy-foreground/70 transition-colors hover:text-brand-orange">
                        {l.label}
                      </A>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-navy-foreground/15 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-navy-foreground/80">{t("footer.availableIn")}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {TOP_CITIES.map((c) => (
                <A key={c.slug} href={`/locations/${c.slug}`} className="text-xs font-medium text-navy-foreground/70 hover:text-brand-orange">
                  {c.name}
                </A>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-navy-foreground/80">{t("footer.popular")}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {["proctology", "laparoscopy", "urology", "orthopaedics"].flatMap((spec) =>
                TOP_CITIES.slice(0, 4).map((c) => {
                  const s = SPECIALITIES.find((x) => x.slug === spec)!;
                  return (
                    <A key={spec + c.slug} href={`/specialities/${spec}/${c.slug}`} className="text-xs text-navy-foreground/60 hover:text-brand-orange">
                      {t("footer.specInCity", { spec: s.name, city: c.name })}
                    </A>
                  );
                }),
              )}
            </div>
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-navy-foreground/55">
            {t("footer.disclaimer")}
          </p>
        </Container>
      </footer>

      <div className="border-t border-white/5 bg-navy-deep py-4 text-center text-xs text-navy-foreground/60">
        <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>{t("footer.copyright", { year: new Date().getFullYear(), name: SITE.name })}</p>
          <div className="flex items-center gap-4">
            <A href="/privacy" className="hover:text-brand-orange">{t("footer.privacy")}</A>
            <span>·</span>
            <A href="/terms" className="hover:text-brand-orange">{t("footer.terms")}</A>
          </div>
        </Container>
      </div>

      {/* Spacer so the fixed mobile bar never covers the last content (incl. iPhone home indicator). */}
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-navy-deep lg:hidden" />

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden">
        <A href={telHref} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-navy/25 bg-background py-2.5 text-sm font-semibold text-navy" onClick={() => track({ type: "call", targetType: "site", targetName: "Care team" })}>
          <Phone className="h-4 w-4 text-brand-orange" /> {t("action.call")}
        </A>
        <A
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white"
          onClick={() => track({ type: "whatsapp", targetType: "site", targetName: "Care team" })}
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </A>
        <A href="/contact" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-md">
          <CalendarCheck className="h-4 w-4" /> {promiseEnabled("free-consult") ? "Book Free" : t("footer.barBook")}
        </A>
      </div>

      {/* Floating WhatsApp button (desktop) */}
      <A
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("footer.whatsappAria", { name: SITE.name })}
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-xl transition-transform hover:scale-105 lg:grid"
        onClick={() => track({ type: "whatsapp", targetType: "site", targetName: "Care team" })}
      >
        <MessageCircle className="h-7 w-7" />
      </A>
    </>
  );
}
