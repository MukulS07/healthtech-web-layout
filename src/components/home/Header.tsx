import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MapPin, Phone, Search, Menu, X, HeartPulse, UserRound } from "lucide-react";
import { Container, OrangeButton } from "./primitives";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getTreatmentCategoriesFn } from "@/lib/server-functions/treatments";

// Shown while the real category list is still loading, so the header isn't empty on
// first paint. Once data arrives these are replaced entirely by the live catalog.
const fallbackSpecialties = [
  { label: "General Surgery", href: "/treatments?category=General%20Surgery" },
  { label: "Orthopedic Surgery", href: "/treatments?category=Orthopedic%20Surgery" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["treatment-categories"],
    queryFn: () => getTreatmentCategoriesFn(),
    staleTime: 5 * 60 * 1000,
  });

  const specialties = useMemo(() => {
    const categories = categoriesData?.success ? categoriesData.categories : [];
    if (categories.length === 0) return null;
    return categories.map((c) => ({
      label: c.category,
      href: `/treatments?category=${encodeURIComponent(c.category)}`,
    }));
  }, [categoriesData]);

  // Most common categories appear on the visible bar (already sorted by count desc
  // server-side); the rest live in the "More Specialties" dropdown.
  const mainSpecialties = specialties ? specialties.slice(0, 6) : fallbackSpecialties;
  const extraSpecialties = specialties ? specialties.slice(6) : [];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="text-navy">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-6">
            <a href="/" className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold">Prime Care</span>
            </a>
            <button className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground lg:flex">
              <MapPin className="h-4 w-4 text-brand-orange" /> Delhi NCR{" "}
              <ChevronDown className="h-4 w-4" />
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
            <a
              href="/faqs"
              className="hidden items-center gap-1 text-sm text-muted-foreground xl:flex hover:text-navy"
            >
              For Patients
            </a>
            <a
              href="/about"
              className="hidden items-center gap-1 text-sm text-muted-foreground xl:flex hover:text-navy"
            >
              Our Company
            </a>
            <a
              href="/account"
              className="hidden items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand-orange sm:flex"
            >
              <UserRound className="h-4 w-4 text-brand-orange" /> My Appointments
            </a>
            <a
              href="/admin"
              className="hidden items-center gap-1 text-xs font-bold text-white bg-navy px-2.5 py-1.5 rounded-md hover:bg-primary transition-colors sm:flex"
            >
              Admin Portal
            </a>
            <a
              href="tel:18000001234"
              className="hidden items-center gap-2 text-sm font-semibold text-navy sm:flex"
            >
              <Phone className="h-4 w-4 text-brand-orange" /> 1800 000 1234
            </a>
            <a href="/contact">
              <OrangeButton className="hidden px-4 py-2.5 md:inline-flex">
                Book Free Consultation
              </OrangeButton>
            </a>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>
      </div>
      <div className="hidden border-t border-border bg-cream/70 lg:block">
        <Container>
          <nav className="no-scrollbar flex items-center gap-6 overflow-x-auto py-2.5 text-sm font-medium">
            {mainSpecialties.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="flex shrink-0 items-center gap-1 whitespace-nowrap text-ink/80 transition-colors hover:text-brand-orange"
              >
                {s.label}
              </a>
            ))}

            {extraSpecialties.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 text-ink/80 transition-colors hover:text-brand-orange outline-none">
                  More Specialties <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {extraSpecialties.map((s) => (
                    <DropdownMenuItem key={s.label} asChild>
                      <a href={s.href} className="w-full cursor-pointer">
                        {s.label}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            <span className="h-4 w-px bg-border shrink-0" />

            <a
              href="/doctors"
              className="flex shrink-0 items-center gap-1 font-semibold text-navy transition-colors hover:text-brand-orange"
            >
              Our Doctors
            </a>
            <a
              href="/hospitals"
              className="flex shrink-0 items-center gap-1 font-semibold text-navy transition-colors hover:text-brand-orange"
            >
              Our Hospitals
            </a>
          </nav>
        </Container>
      </div>

      {mobileOpen ? (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <Container className="space-y-5 py-5">
            <div className="flex items-center gap-2 rounded-lg bg-brand-orange-soft px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
                placeholder="Search treatments, conditions, doctors"
              />
            </div>

            <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4 text-brand-orange" /> Delhi NCR{" "}
              <ChevronDown className="h-4 w-4" />
            </button>

            <a href="/contact" className="block">
              <OrangeButton className="w-full">Book Free Consultation</OrangeButton>
            </a>

            <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-navy">
              <a
                href="/account"
                className="flex items-center gap-1.5 hover:text-brand-orange"
              >
                <UserRound className="h-4 w-4 text-brand-orange" /> My Appointments
              </a>
              <a href="tel:18000001234" className="flex items-center gap-1.5 hover:text-brand-orange">
                <Phone className="h-4 w-4 text-brand-orange" /> Call Us
              </a>
              <a href="/faqs" className="font-medium text-muted-foreground hover:text-navy">
                For Patients
              </a>
              <a href="/about" className="font-medium text-muted-foreground hover:text-navy">
                Our Company
              </a>
              <a href="/admin" className="font-medium text-muted-foreground hover:text-navy">
                Admin Portal
              </a>
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Specialities
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm font-medium text-ink/80">
                {[...mainSpecialties, ...extraSpecialties].map((s) => (
                  <a key={s.label} href={s.href} className="hover:text-brand-orange">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-navy">
                <a href="/doctors" className="hover:text-brand-orange">
                  Our Doctors
                </a>
                <a href="/hospitals" className="hover:text-brand-orange">
                  Our Hospitals
                </a>
              </div>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
