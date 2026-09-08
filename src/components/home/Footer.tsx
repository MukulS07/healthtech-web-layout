import { Phone, CalendarCheck, HeartPulse } from "lucide-react";
import { Container } from "./primitives";

const columns = [
  {
    title: "Specialities",
    links: ["Proctology", "Laparoscopy", "Gynaecology", "ENT", "Urology", "Orthopedics"],
  },
  {
    title: "Popular Treatments",
    links: ["Piles Surgery", "Hernia Surgery", "Kidney Stone", "Cataract", "Gallstone", "Knee Replacement"],
  },
  {
    title: "Company",
    links: ["About Us", "Our Hospitals", "Careers", "Healthfeed", "Contact Us", "Press"],
  },
  {
    title: "For Patients",
    links: ["Book Consultation", "Insurance Support", "No-Cost EMI", "Patient Stories", "FAQs", "Feedback"],
  },
];

const cities = [
  "Delhi NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Kochi",
  "Indore",
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
              <a href="#book" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4 text-brand-orange" /> 1800 000 1234
              </a>
            </div>
            {columns.map((col) => (
              <div key={col.title} className="min-w-0">
                <p className="text-sm font-bold">{col.title}</p>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="text-sm text-navy-foreground/70 transition-colors hover:text-brand-orange">
                        {l}
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
                <a key={c} href="#top" className="text-sm text-navy-foreground/70 hover:text-brand-orange">
                  {c}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </footer>
      <div className="bg-navy-deep py-4 text-center text-xs text-navy-foreground/60">
        <Container>
          © {new Date().getFullYear()} Prime Care. Illustrative demo site. Privacy Policy · Terms of Use
        </Container>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-border bg-background p-3 lg:hidden">
        <a
          href="#book"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy/25 py-3 text-sm font-semibold text-navy"
        >
          <Phone className="h-4 w-4" /> Call Now
        </a>
        <a
          href="#book"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-orange py-3 text-sm font-semibold text-primary-foreground"
        >
          <CalendarCheck className="h-4 w-4" /> Book Free
        </a>
      </div>
    </>
  );
}
