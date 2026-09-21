import { CalendarCheck, HeartPulse, Mail, MessageCircle, Phone } from "lucide-react";
import { Container } from "./primitives";
import { BOOK_LABEL, CITIES, promiseEnabled, SITE, telHref, whatsappHref } from "@/lib/site";
import { SPECIALITIES } from "@/data/catalog";

const columns = [
  {
    title: "Specialities",
    links: [
      ...SPECIALITIES.slice(0, 8).map((s) => ({ label: s.name, href: `/specialities/${s.slug}` })),
      { label: `All ${SPECIALITIES.length} specialities`, href: "/specialities" },
    ],
  },
  {
    title: "Popular Treatments",
    links: [
      { label: "Laser Piles Surgery", href: "/treatments/laser-piles-surgery" },
      { label: "Gallbladder Removal", href: "/treatments/laparoscopic-cholecystectomy" },
      { label: "Hernia Repair", href: "/treatments/laparoscopic-hernia-repair" },
      { label: "Kidney Stone (RIRS)", href: "/treatments/rirs" },
      { label: "Cataract Surgery", href: "/treatments/phaco-cataract-surgery" },
      { label: "Knee Replacement", href: "/treatments/total-knee-replacement" },
      { label: "All treatments", href: "/treatments" },
      { label: "All conditions", href: "/conditions" },
    ],
  },
  {
    title: "For Patients",
    links: [
      { label: BOOK_LABEL, href: "/contact" },
      { label: "Find Doctors", href: "/doctors" },
      { label: "Find Hospitals", href: "/hospitals" },
      { label: "Ask a Question", href: "/ask-a-question" },
      { label: "Patient Reviews", href: "/reviews" },
      { label: "Write a Review", href: "/reviews/write" },
      { label: "Treatment Cost", href: "/cost" },
      { label: "No-Cost EMI", href: "/no-cost-emi" },
      { label: "Insurance Eligibility", href: "/insurance-eligibility" },
      { label: "EMI Calculator", href: "/emi-calculator" },
      { label: "Pregnancy Due Date Calculator", href: "/pregnancy-due-date-calculator" },
      { label: "Patient Help", href: "/patient-help" },
      { label: "FAQs", href: "/faqs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Healthfeed", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Partner With Us (Doctors)", href: "/doctor-onboarding" },
      { label: "Contact Us", href: "/contact" },
      { label: "Locations", href: "/locations" },
      { label: "Editorial Policy", href: "/editorial-policy" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

export function Footer() {
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
                Helping patients find experienced surgeons, understand their treatment and get support
                from first consultation to recovery.
              </p>
              <div className="mt-4 space-y-2 text-sm font-semibold">
                <a href={telHref} className="flex items-center gap-2 hover:text-brand-orange">
                  <Phone className="h-4 w-4 shrink-0 text-brand-orange" /> {SITE.phone.display}
                </a>
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand-orange">
                  <MessageCircle className="h-4 w-4 shrink-0 text-brand-orange" /> WhatsApp us
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-brand-orange">
                  <Mail className="h-4 w-4 shrink-0 text-brand-orange" /> {SITE.email}
                </a>
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-bold tracking-wide text-navy-foreground">{col.title}</p>
                <ul className="mt-3.5 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <a href={l.href} className="rounded text-sm text-navy-foreground/70 transition-colors hover:text-brand-orange">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-navy-foreground/15 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-navy-foreground/80">We are available in</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {CITIES.map((c) => (
                <a key={c.slug} href={`/locations/${c.slug}`} className="text-xs font-medium text-navy-foreground/70 hover:text-brand-orange">
                  {c.name}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-navy-foreground/80">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {["proctology", "laparoscopy", "urology", "orthopaedics"].flatMap((spec) =>
                CITIES.slice(0, 4).map((c) => {
                  const s = SPECIALITIES.find((x) => x.slug === spec)!;
                  return (
                    <a key={spec + c.slug} href={`/specialities/${spec}/${c.slug}`} className="text-xs text-navy-foreground/60 hover:text-brand-orange">
                      {s.name} in {c.name}
                    </a>
                  );
                }),
              )}
            </div>
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-navy-foreground/55">
            Hospital and insurer names and trademarks belong to their respective owners; a listing does
            not imply affiliation or endorsement. Information on this website is for general education and
            is not a substitute for professional medical advice. In an emergency, call 112.
          </p>
        </Container>
      </footer>

      <div className="border-t border-white/5 bg-navy-deep py-4 text-center text-xs text-navy-foreground/60">
        <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-brand-orange">Privacy Policy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-brand-orange">Terms of Use</a>
          </div>
        </Container>
      </div>

      {/* Spacer so the fixed mobile bar never covers the last content (incl. iPhone home indicator). */}
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-navy-deep lg:hidden" />

      {/* Sticky mobile CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-border bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden">
        <a href={telHref} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-navy/25 bg-background py-2.5 text-sm font-semibold text-navy">
          <Phone className="h-4 w-4 text-brand-orange" /> Call
        </a>
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <a href="/contact" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-md">
          <CalendarCheck className="h-4 w-4" /> {promiseEnabled("free-consult") ? "Book Free" : "Book"}
        </a>
      </div>

      {/* Floating WhatsApp button (desktop) */}
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Go Surgery on WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-xl transition-transform hover:scale-105 lg:grid"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </>
  );
}
