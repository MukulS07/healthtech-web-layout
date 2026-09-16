import { Phone, Star, ShieldCheck, BadgeCheck, HeartHandshake, CalendarCheck } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.png";
import { Container, OrangeButton, OutlineButton } from "./primitives";
import { ConsultForm } from "./ConsultForm";

const trustItems = [
  { icon: ShieldCheck, title: "Insurance guidance", sub: "Clear support, fewer forms" },
  { icon: BadgeCheck, title: "Verified specialists", sub: "Experienced care teams" },
  { icon: HeartHandshake, title: "Personal care guide", sub: "Support at every step" },
  { icon: CalendarCheck, title: "Free first consultation", sub: "Start with clarity" },
];

export function Hero() {
  return (
    <section id="top" className="bg-cream py-6 sm:py-10">
      <Container>
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Main Hero Card */}
          <div className="flex min-w-0 flex-col justify-between rounded-xl bg-navy p-6 text-navy-foreground sm:p-8 lg:col-span-7 lg:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy shadow-sm">
                  <span className="flex -space-x-1.5">
                    {["bg-primary", "bg-brand-blue-light", "bg-emerald-600"].map((color) => (
                      <span
                        key={color}
                        className={`h-3.5 w-3.5 rounded-full border border-background ${color}`}
                      />
                    ))}
                  </span>
                  Trusted by 2M+ patients
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary shrink-0" /> 4.8/5 patient rating
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl tracking-tight">
                Thoughtful care for every step of your{" "}
                <span className="text-brand-blue-light">health journey.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/80 sm:text-base">
                Find the right specialist, understand your treatment, and feel supported from your
                first conversation through recovery.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#specialities">
                <OrangeButton>Browse Specialties</OrangeButton>
              </a>
              <a href="tel:18000001234">
                <OutlineButton tone="light" className="gap-2">
                  <Phone className="h-4 w-4 text-brand-orange" /> Call our care team
                </OutlineButton>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-navy-foreground/15 pt-6 sm:gap-6">
              {[
                { value: "1,200+", label: "Specialists on call" },
                { value: "45 min", label: "Average response" },
                { value: "60+", label: "Partner hospitals" },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <p className="text-xl font-bold text-brand-blue-light sm:text-2xl lg:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 truncate text-xs text-navy-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consultation Form Card */}
          <div id="book" className="min-w-0 lg:col-span-5">
            <ConsultForm />
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex min-w-0 items-center gap-3.5 rounded-xl border border-border/60 bg-background p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-orange-soft text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
