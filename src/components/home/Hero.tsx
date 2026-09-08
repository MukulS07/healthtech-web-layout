import { Phone, Star, ShieldCheck, BadgeCheck, HeartHandshake, CalendarCheck } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.png";
import { Container, OrangeButton } from "./primitives";
import { ConsultForm } from "./ConsultForm";

const trustItems = [
  { icon: ShieldCheck, title: "Cashless on 100+ Insurers", sub: "30-minute approvals" },
  { icon: BadgeCheck, title: "USFDA-Approved Procedures", sub: "Advanced technology" },
  { icon: HeartHandshake, title: "Dedicated Care Team", sub: "End-to-end support" },
  { icon: CalendarCheck, title: "Free Consultation", sub: "With expert surgeons" },
];

export function Hero() {
  return (
    <section id="top">
      <div className="bg-[linear-gradient(120deg,var(--brand-blue-dark),var(--brand-blue))]">
        <Container className="grid items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.85fr_0.75fr] lg:py-14">
          <div className="min-w-0 text-navy-foreground">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-navy">
                <span className="flex -space-x-2">
                  {["bg-brand-orange", "bg-brand-blue-light", "bg-navy"].map((c) => (
                    <span key={c} className={`h-4 w-4 rounded-full border border-background ${c}`} />
                  ))}
                </span>
                Trusted by 2M+ Patients
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-navy">
                <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> 4.8/5 Patient Rating
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-5xl">
              Surgery Matlab <span className="text-brand-orange">Prime Care</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-navy-foreground/85 sm:text-base">
              Specialist surgeons, modern hospitals and safer surgeries for 50+ conditions — with insurance,
              transport and recovery handled for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <OrangeButton>Book Free Consultation</OrangeButton>
              <a
                href="#book"
                className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/40 px-5 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy-foreground/10"
              >
                <Phone className="h-4 w-4" /> Call Now : 1800 000 1234
              </a>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <img
              src={heroDoctor}
              alt="Specialist surgeon in a white coat"
              width={900}
              height={1100}
              className="max-h-[460px] w-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div id="book" className="min-w-0">
            <ConsultForm />
          </div>
        </Container>
      </div>

      <div className="border-b border-border bg-background">
        <Container className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-orange-soft text-brand-orange">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-navy">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
}
