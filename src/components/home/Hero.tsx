import { Phone, Star, ShieldCheck, BadgeCheck, HeartHandshake, CalendarCheck } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.png";
import { Container, OrangeButton } from "./primitives";
import { ConsultForm } from "./ConsultForm";

const trustItems = [
  { icon: ShieldCheck, title: "Insurance guidance", sub: "Clear support, fewer forms" },
  { icon: BadgeCheck, title: "Verified specialists", sub: "Experienced care teams" },
  { icon: HeartHandshake, title: "Personal care guide", sub: "Support at every step" },
  { icon: CalendarCheck, title: "Free first consultation", sub: "Start with clarity" },
];

export function Hero() {
  return (
    <section id="top" className="bg-cream py-6 sm:py-8">
      <Container>
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[220px_220px]">
          <div className="min-w-0 rounded-lg bg-navy p-7 text-navy-foreground lg:col-span-7 lg:row-span-2 lg:p-10">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy">
                <span className="flex -space-x-2">
                  {["bg-primary", "bg-brand-blue-light", "bg-navy"].map((color) => (
                    <span key={color} className={`h-4 w-4 rounded-full border border-background ${color}`} />
                  ))}
                </span>
                Trusted by 2M+ patients
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-navy">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" /> 4.8/5 patient rating
              </span>
            </div>
            <h1 className="mt-8 max-w-2xl text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              Thoughtful care for every step of your <span className="text-brand-blue-light">health journey.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-navy-foreground/80">
              Find the right specialist, understand your treatment, and feel supported from your first conversation through recovery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <OrangeButton>Find the right care</OrangeButton>
              <a href="#book" className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/35 px-5 py-3 text-sm font-semibold text-navy-foreground hover:bg-navy-foreground/10">
                <Phone className="h-4 w-4" /> Call our care team
              </a>
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-lg bg-brand-orange-soft lg:col-span-5 lg:flex">
            <img src={heroDoctor} alt="Care specialist ready to help" width={900} height={1100} className="h-full w-full object-contain object-bottom" />
            <div className="absolute bottom-4 left-4 rounded-lg bg-background p-3 shadow-sm">
              <p className="text-xs text-muted-foreground">Care team available</p>
              <p className="text-sm font-bold text-navy">Today · 8:00 AM–8:00 PM</p>
            </div>
          </div>

          <div id="book" className="min-w-0 lg:col-span-5">
            <ConsultForm />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex min-w-0 items-center gap-3 rounded-lg border border-navy/10 bg-background p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-orange-soft text-primary">
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