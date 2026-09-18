import { useState } from "react";
import {
  Phone,
  Search,
  Menu,
  X,
  HeartPulse,
  UserRound,
  ShieldCheck,
  Stethoscope,
  Building2,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Container, OrangeButton } from "./primitives";

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/doctors" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="text-navy">
        <Container className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <div className="flex min-w-0 items-center gap-4 lg:gap-6">
            <a href="/" className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold tracking-tight">Go Surgery</span>
            </a>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/40 bg-brand-orange-soft/60 px-3.5 py-2 lg:flex focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
            >
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground/80"
                placeholder="Search treatments, conditions, doctors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-3 lg:gap-4">
            <a
              href="/faqs"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground xl:flex hover:text-navy transition-colors"
            >
              For Patients
            </a>
            <a
              href="/about"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground xl:flex hover:text-navy transition-colors"
            >
              Our Company
            </a>
            <a
              href="/account"
              className="hidden items-center gap-1.5 text-sm font-semibold text-navy hover:text-brand-orange sm:flex transition-colors"
            >
              <UserRound className="h-4 w-4 text-brand-orange" /> My Appointments
            </a>
            <a
              href="/admin"
              className="hidden items-center gap-1 text-xs font-bold text-white bg-navy px-3 py-1.5 rounded-md hover:bg-primary transition-colors sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </a>
            <a
              href="tel:18000001234"
              className="hidden items-center gap-2 text-sm font-semibold text-navy hover:text-primary sm:flex transition-colors"
            >
              <Phone className="h-4 w-4 text-brand-orange" /> 1800 000 1234
            </a>
            <a href="/contact" className="hidden md:inline-flex">
              <OrangeButton className="px-4 py-2.5">
                Book Free Consultation
              </OrangeButton>
            </a>

            {/* Mobile Drawer Trigger Button */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-border/80 bg-background text-navy hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>
      </div>

      {/* Main Subheader Category Nav Bar */}
      <div className="border-t border-border bg-cream/70 backdrop-blur-sm">
        <Container>
          <nav className="no-scrollbar flex items-center gap-5 overflow-x-auto py-2.5 text-sm font-medium">
            <a
              href="/doctors"
              className="flex shrink-0 items-center gap-1.5 font-semibold text-navy transition-colors hover:text-brand-orange"
            >
              <Stethoscope className="h-4 w-4 text-emerald-600" /> Our Doctors
            </a>
            <a
              href="/hospitals"
              className="flex shrink-0 items-center gap-1.5 font-semibold text-navy transition-colors hover:text-brand-orange"
            >
              <Building2 className="h-4 w-4 text-primary" /> Our Hospitals
            </a>
          </nav>
        </Container>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[105px] z-40 border-b border-border bg-background p-5 shadow-2xl lg:hidden animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <Search className="h-4 w-4 text-primary shrink-0" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search treatments or doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-navy">
              <a
                href="/doctors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-cream p-3 hover:bg-cream/80"
              >
                <Stethoscope className="h-4 w-4 text-emerald-600" /> Our Doctors
              </a>
              <a
                href="/hospitals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-cream p-3 hover:bg-cream/80"
              >
                <Building2 className="h-4 w-4 text-primary" /> Our Hospitals
              </a>
              <a
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-cream p-3 hover:bg-cream/80"
              >
                <UserRound className="h-4 w-4 text-brand-orange" /> Appointments
              </a>
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-navy text-white p-3 hover:bg-primary"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Portal
              </a>
            </div>

            <div className="pt-2 border-t border-border flex flex-col gap-2.5">
              <a href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <OrangeButton className="w-full justify-center">Book Free Consultation</OrangeButton>
              </a>
              <a
                href="tel:18000001234"
                className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-navy hover:bg-muted"
              >
                <Phone className="h-4 w-4 text-brand-orange" /> Call 1800 000 1234
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
