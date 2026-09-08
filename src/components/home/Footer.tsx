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
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
  {
    title: "For Patients",
    links: [
      { label: "Book Consultation", href: "/contact" },
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
          <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold">Prime Care</span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-navy-foreground/70">
                Specialist surgeons, modern hospitals and safer surgeries across 45+ cities in India.
              </p>
              <a href="tel:18000001234" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-brand-orange" /> 1800 000 1234
              </a>
            </div>
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-bold">{col.title}</p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-navy-foreground/70 transition-colors hover:text-brand-orange">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-navy-foreground/15 pt-6">
            <p className="text-sm font-bold">We are available in</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {cities.map((c) => (
                <a key={c.label} href={c.href} className="text-sm text-navy-foreground/70 hover:text-brand-orange">
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
      <div className="bg-navy-deep py-4 text-center text-xs text-navy-foreground/60">
        <Container>
          © {new Date().getFullYear()} Prime Care. Illustrative demo site.{" "}
          <a href="/privacy" className="hover:text-brand-orange">Privacy Policy</a>
          {" · "}
          <a href="/terms" className="hover:text-brand-orange">Terms of Use</a>
        </Container>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-border bg-background p-3 lg:hidden">
        <a
          href="tel:18000001234"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/25 py-3 text-sm font-semibold text-navy"
        >
          <Phone className="h-4 w-4" /> Call Now
        </a>
        <a
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange py-3 text-sm font-semibold text-primary-foreground"
        >
          <CalendarCheck className="h-4 w-4" /> Book Free
        </a>
      </div>
    </>
  );
}
