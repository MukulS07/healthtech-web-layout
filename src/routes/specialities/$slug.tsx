import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Star, Phone } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Carousel, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

type SpecialtyInfo = {
  name: string;
  tagline: string;
  about: string;
  stats: { value: string; label: string }[];
  treatments: { name: string; slug: string; desc: string }[];
  conditions: string[];
};

const specialtyData: Record<string, SpecialtyInfo> = {
  proctology: {
    name: "Proctology",
    tagline: "Expert care for colorectal conditions — minimally invasive, same-day discharge.",
    about: "Our proctology specialists handle the full spectrum of colorectal conditions — from piles and fissures to pilonidal sinus and rectal prolapse. We use advanced laser and minimally invasive techniques that reduce pain, eliminate visible scars and enable rapid recovery.",
    stats: [{ value: "50,000+", label: "Procedures Done" }, { value: "98%", label: "Success Rate" }, { value: "3 Days", label: "Average Recovery" }, { value: "100+", label: "Specialists" }],
    treatments: [
      { name: "Piles Surgery", slug: "piles-surgery", desc: "Laser proctoplasty or MIPH for all grades of haemorrhoids." },
      { name: "Anal Fissure Treatment", slug: "anal-fissure", desc: "Laser sphincterotomy — painless, no cuts, heals in days." },
      { name: "Fistula Treatment", slug: "fistula-treatment", desc: "VAAFT / laser treatment with zero recurrence risk." },
      { name: "Pilonidal Sinus", slug: "pilonidal-sinus", desc: "Laser ablation for the chronic cyst at the base of the spine." },
      { name: "Rectal Prolapse Repair", slug: "rectal-prolapse", desc: "Laparoscopic rectopexy for prolapsed rectum correction." },
      { name: "Circumcision", slug: "circumcision", desc: "Laser circumcision — sterile, painless and quick." },
    ],
    conditions: ["Internal Haemorrhoids", "External Haemorrhoids", "Anal Fissure", "Anal Fistula", "Pilonidal Sinus", "Rectal Prolapse", "Rectal Polyps", "Constipation (chronic)"],
  },
};

const fallbackSpecialty: SpecialtyInfo = {
  name: "Specialty",
  tagline: "Expert surgical care for this specialty — minimally invasive with fast recovery.",
  about: "Our specialists use the most advanced techniques in this field, with an emphasis on patient safety, minimal downtime and clear communication throughout the care journey.",
  stats: [{ value: "10,000+", label: "Procedures Done" }, { value: "97%", label: "Success Rate" }, { value: "24–48 hrs", label: "Discharge Time" }, { value: "50+", label: "Specialists" }],
  treatments: [
    { name: "Primary Procedure", slug: "primary-procedure", desc: "The most common surgical approach for this specialty." },
    { name: "Advanced Technique", slug: "advanced-technique", desc: "Minimally invasive option for eligible patients." },
    { name: "Corrective Surgery", slug: "corrective-surgery", desc: "For recurrent or complex presentations." },
  ],
  conditions: ["Condition A", "Condition B", "Condition C", "Condition D", "Condition E", "Condition F"],
};

const doctors = [
  { name: "Dr. Karan Mehta", cat: "Laparoscopic Surgeon", cred: "MBBS, MS (General Surgery)", exp: "11 Years", rating: "4.9", img: doctor3 },
  { name: "Dr. Pradeep Dutta", cat: "Senior Surgeon", cred: "MBBS, MD (Surgery)", exp: "27 Years", rating: "4.5", img: doctor2 },
  { name: "Dr. Ananya Rao", cat: "Colorectal Specialist", cred: "MBBS, MS, FAIS", exp: "14 Years", rating: "4.8", img: doctor1 },
];

export const Route = createFileRoute("/specialities/$slug")({
  head: ({ params }) => {
    const data = specialtyData[params.slug] ?? fallbackSpecialty;
    return {
      meta: [
        { title: `${data.name} | Prime Care` },
        { name: "description", content: data.tagline },
      ],
    };
  },
  component: SpecialtyPage,
});

function SpecialtyPage() {
  const { slug } = Route.useParams();
  const data = specialtyData[slug] ?? { ...fallbackSpecialty, name: slug.charAt(0).toUpperCase() + slug.slice(1) };

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <span className="font-medium text-ink">{data.name}</span>
          </Container>
        </nav>

        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Specialty</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">{data.name}</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">{data.tagline}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-white/10 px-4 py-3 text-center">
                  <p className="text-xl font-extrabold text-brand-orange sm:text-2xl">{s.value}</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="min-w-0 space-y-12">
              <section>
                <h2 className="text-xl font-bold text-navy">About {data.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{data.about}</p>
              </section>

              <section>
                <SectionHead eyebrow="What we treat" title={`${data.name} Treatments`} />
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.treatments.map((t) => (
                    <a
                      key={t.slug}
                      href={`/treatments/${t.slug}`}
                      className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-cream p-4 transition-shadow hover:shadow-md"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-navy">{t.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-navy">Conditions We Treat</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {data.conditions.map((c) => (
                    <span key={c} className="rounded-full bg-cream px-4 py-2 text-sm font-medium text-ink/80 border border-border">
                      {c}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <SectionHead
                  eyebrow="Our specialists"
                  title={`${data.name} Experts`}
                  action={<OutlineButton>View All Doctors</OutlineButton>}
                />
                <Carousel>
                  {doctors.map((d) => (
                    <article key={d.name} className="w-[260px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[300px]">
                      <div className="relative">
                        <img src={d.img} alt={d.name} loading="lazy" width={700} height={700} className="h-52 w-full object-cover" />
                        <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[11px] font-semibold text-navy-foreground">{d.cat}</span>
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs font-bold text-navy">
                          <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" /> {d.rating}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="truncate text-sm font-bold text-navy">{d.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{d.cred}</p>
                        <p className="mt-1.5 text-xs font-semibold text-brand-blue">{d.exp} Experience</p>
                        <div className="mt-3 flex gap-2">
                          <OutlineButton className="flex-1 px-2 py-1.5 text-xs">
                            <Phone className="h-3 w-3" /> Call
                          </OutlineButton>
                          <OrangeButton className="flex-1 px-2 py-1.5 text-xs">Book Now</OrangeButton>
                        </div>
                      </div>
                    </article>
                  ))}
                </Carousel>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <ConsultForm />
            </aside>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
