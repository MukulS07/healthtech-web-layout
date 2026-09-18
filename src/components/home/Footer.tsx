import { Phone, CalendarCheck, HeartPulse } from "lucide-react";
import { Container } from "./primitives";

const columns = [
  {
    title: "Specialities",
    links: [
      { label: "Proctology", href: "/specialities/proctology" },
      { label: "Laparoscopy", href: "/specialities/laparoscopy" },
      { label: "Gynaecology", href: "/specialities/gynaecology" },
      { label: "ENT", href: "/specialities/ent" },
      { label: "Urology", href: "/specialities/urology" },
      { label: "Orthopedics", href: "/specialities/orthopedics" },
    ],
  },
  {
    title: "Popular Treatments",
    links: [
      { label: "Piles Surgery", href: "/treatments/piles-surgery" },
      { label: "Hernia Surgery", href: "/treatments/hernia-surgery" },
      { label: "Kidney Stone", href: "/treatments/kidney-stone" },
      { label: "Cataract", href: "/treatments/cataract" },
      { label: "Gallstone", href: "/treatments/gallstone" },
      { label: "Knee Replacement", href: "/treatments/knee-replacement" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Hospitals", href: "/hospitals" },
      { label: "Healthfeed", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Doctor Onboarding", href: "/doctor-onboarding" },
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
  {
    title: "For Patients",
    links: [
      { label: "Book Consultation", href: "/contact" },
      { label: "Patient Help", href: "/patient-help" },
      { label: "Patient Stories", href: "/reviews" },
      { label: "FAQs", href: "/faqs" },
      { label: "Find Doctors", href: "/doctors" },
      { label: "Find Hospitals", href: "/hospitals" },
      { label: "Locations", href: "/locations" },
    ],
  },
];

const cities = [
  { label: "Delhi NCR", href: "/locations/delhi-ncr" },
  { label: "Mumbai", href: "/locations/mumbai" },
  { label: "Bangalore", href: "/locations/bangalore" },
  { label: "Hyderabad", href: "/locations/hyderabad" },
  { label: "Chennai", href: "/locations/chennai" },
  { label: "Pune", href: "/locations/pune" },
  { label: "Kolkata", href: "/locations/kolkata" },
  { label: "Ahmedabad", href: "/locations/ahmedabad" },
  { label: "Jaipur", href: "/locations/jaipur" },
  { label: "Lucknow", href: "/locations/lucknow" },
  { label: "Kochi", href: "/locations/kochi" },
  { label: "Indore", href: "/locations/indore" },
];

export function Footer() {
  return (
    <>
      <footer className="bg-navy pb-24 pt-14 text-navy-foreground lg:pb-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] lg:gap-10">
            <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold tracking-tight">Go Surgery</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-foreground/75">
                Specialist surgeons, modern hospitals, and safer surgeries across 45+ cities in India.
              </p>
              <a
                href="tel:18000001234"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy-foreground hover:text-brand-orange transition-colors"
              >
                <Phone className="h-4 w-4 text-brand-orange shrink-0" /> 1800 000 1234
              </a>
            </div>
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-bold tracking-wide text-navy-foreground">{col.title}</p>
                <ul className="mt-3.5 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-navy-foreground/70 transition-colors hover:text-brand-orange focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                      >
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
              {cities.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="text-xs font-medium text-navy-foreground/70 transition-colors hover:text-brand-orange"
                >
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
      
      <div className="bg-navy-deep py-4 text-center text-xs text-navy-foreground/60 border-t border-white/5">
        <Container className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p>© {new Date().getFullYear()} Go Surgery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="transition-colors hover:text-brand-orange">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="/terms" className="transition-colors hover:text-brand-orange">
              Terms of Use
            </a>
          </div>
        </Container>
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2.5 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden shadow-lg">
        <a
          href="tel:18000001234"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/25 bg-background py-2.5 text-sm font-semibold text-navy hover:bg-muted active:scale-[0.98] transition-all"
        >
          <Phone className="h-4 w-4 text-brand-orange" /> Call Now
        </a>
        <a
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <CalendarCheck className="h-4 w-4" /> Book Free
        </a>
      </div>
    </>
  );
}
