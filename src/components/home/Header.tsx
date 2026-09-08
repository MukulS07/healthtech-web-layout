import { ChevronDown, MapPin, Phone, Search, Menu, HeartPulse } from "lucide-react";
import { Container, OrangeButton } from "./primitives";

const specialties = [
  "Proctology",
  "Laparoscopy",
  "Gynaecology",
  "ENT",
  "Urology",
  "Vascular",
  "Aesthetics",
  "Orthopedics",
  "Ophthalmology",
  "Fertility",
  "Weight Loss",
  "Dermatology",
  "Our Hospitals",
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="text-navy">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-6">
            <a href="#top" className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold">Prime Care</span>
            </a>
            <button className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground lg:flex">
              <MapPin className="h-4 w-4 text-brand-orange" /> Delhi NCR <ChevronDown className="h-4 w-4" />
            </button>
            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg bg-brand-orange-soft px-3 py-2 lg:flex">
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
                placeholder="Search treatments, conditions, doctors"
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <button className="hidden items-center gap-1 text-sm text-muted-foreground xl:flex">
              For Patients <ChevronDown className="h-4 w-4" />
            </button>
            <button className="hidden items-center gap-1 text-sm text-muted-foreground xl:flex">
              Our Company <ChevronDown className="h-4 w-4" />
            </button>
            <a href="#book" className="hidden items-center gap-2 text-sm font-semibold text-navy sm:flex">
              <Phone className="h-4 w-4 text-brand-orange" /> 1800 000 1234
            </a>
            <OrangeButton className="hidden px-4 py-2.5 md:inline-flex">Book Free Consultation</OrangeButton>
            <button aria-label="Menu" className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </div>
      <div className="border-t border-border bg-cream/70">
        <Container>
          <nav className="no-scrollbar flex gap-6 overflow-x-auto py-3">
            {specialties.map((s) => (
              <button
                key={s}
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-ink/80 transition-colors hover:text-brand-orange"
              >
                {s} <ChevronDown className="h-3.5 w-3.5" />
              </button>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
