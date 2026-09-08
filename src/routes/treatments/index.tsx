import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight, Clock } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";

const specialtyFilters = ["All", "Proctology", "Laparoscopy", "Gynaecology", "ENT", "Urology", "Orthopedics", "Ophthalmology", "Aesthetics", "Vascular"];

const allTreatments = [
  { name: "Piles Surgery", slug: "piles-surgery", specialty: "Proctology", desc: "Minimally invasive laser treatment for painful haemorrhoids.", cost: "₹30,000 – ₹60,000", duration: "30 min" },
  { name: "Hernia Repair", slug: "hernia-repair", specialty: "Laparoscopy", desc: "Laparoscopic hernia repair with fast same-day discharge.", cost: "₹50,000 – ₹90,000", duration: "1 hr" },
  { name: "Gallstone Removal", slug: "gallstone-removal", specialty: "Laparoscopy", desc: "Keyhole cholecystectomy – safe and quick gallbladder removal.", cost: "₹60,000 – ₹1,00,000", duration: "1 hr" },
  { name: "Kidney Stone Treatment", slug: "kidney-stone-treatment", specialty: "Urology", desc: "RIRS or PCNL procedure for complete stone clearance.", cost: "₹40,000 – ₹80,000", duration: "45 min" },
  { name: "Cataract Surgery", slug: "cataract-surgery", specialty: "Ophthalmology", desc: "Phacoemulsification with premium IOL implantation.", cost: "₹25,000 – ₹50,000", duration: "20 min" },
  { name: "Knee Replacement", slug: "knee-replacement", specialty: "Orthopedics", desc: "Total or partial knee arthroplasty for lasting pain relief.", cost: "₹2,00,000 – ₹3,50,000", duration: "2 hrs" },
  { name: "Hysterectomy", slug: "hysterectomy", specialty: "Gynaecology", desc: "Laparoscopic uterus removal with minimal scarring.", cost: "₹80,000 – ₹1,20,000", duration: "2 hrs" },
  { name: "Tonsil Removal", slug: "tonsillectomy", specialty: "ENT", desc: "Coblation tonsillectomy for recurrent throat infections.", cost: "₹30,000 – ₹55,000", duration: "30 min" },
  { name: "Anal Fissure Treatment", slug: "anal-fissure", specialty: "Proctology", desc: "Laser sphincterotomy – painless, no cuts, quick recovery.", cost: "₹25,000 – ₹45,000", duration: "20 min" },
  { name: "Varicocele Surgery", slug: "varicocele-surgery", specialty: "Urology", desc: "Laparoscopic varicocelectomy for male fertility improvement.", cost: "₹35,000 – ₹65,000", duration: "1 hr" },
  { name: "Deviated Septum", slug: "septoplasty", specialty: "ENT", desc: "Septoplasty to correct nasal obstruction and improve breathing.", cost: "₹30,000 – ₹60,000", duration: "1 hr" },
  { name: "Liposuction", slug: "liposuction", specialty: "Aesthetics", desc: "VASER or laser-assisted fat removal for body contouring.", cost: "₹80,000 – ₹2,00,000", duration: "2 hrs" },
  { name: "Pilonidal Sinus", slug: "pilonidal-sinus", specialty: "Proctology", desc: "Laser treatment for a painful cyst at the base of the spine.", cost: "₹30,000 – ₹55,000", duration: "30 min" },
  { name: "Hip Replacement", slug: "hip-replacement", specialty: "Orthopedics", desc: "Total hip arthroplasty for chronic pain and mobility issues.", cost: "₹2,50,000 – ₹4,00,000", duration: "2 hrs" },
  { name: "Varicose Veins", slug: "varicose-veins", specialty: "Vascular", desc: "Laser ablation (EVLA) for swollen leg veins – no incisions.", cost: "₹50,000 – ₹90,000", duration: "1 hr" },
  { name: "Fibroid Removal", slug: "fibroid-removal", specialty: "Gynaecology", desc: "Laparoscopic myomectomy to remove fibroids, preserving the uterus.", cost: "₹70,000 – ₹1,10,000", duration: "1.5 hrs" },
];

export const Route = createFileRoute("/treatments/")({
  head: () => ({
    meta: [
      { title: "All Treatments & Procedures | Prime Care" },
      { name: "description", content: "Browse 50+ surgical treatments across 13 specialties. Compare costs, procedure types and book a free consultation." },
    ],
  }),
  component: TreatmentsPage,
});

function TreatmentsPage() {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = allTreatments.filter((t) => {
    const matchSpec = active === "All" || t.specialty === active;
    const matchQ = !query || t.name.toLowerCase().includes(query.toLowerCase());
    return matchSpec && matchQ;
  });

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">What we treat</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">All Treatments & Procedures</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              50+ surgical treatments across 13 specialties. Minimally invasive, fast discharge, cashless on 100+ insurers.
            </p>
            <div className="mt-6 flex max-w-lg items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-brand-orange" />
              <input
                className="w-full bg-transparent text-sm text-navy-foreground placeholder:text-navy-foreground/50 outline-none"
                placeholder="Search treatments — e.g. piles, hernia, cataract…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </Container>
        </section>

        <section className="py-12">
          <Container>
            <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto pb-1">
              {specialtyFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active === s ? "bg-navy text-navy-foreground" : "bg-cream text-ink/70 hover:text-navy"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">No treatments match — try a different search or specialty.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((t) => (
                  <article key={t.slug} className="flex flex-col rounded-lg border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
                    <span className="w-fit rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
                      {t.specialty}
                    </span>
                    <h2 className="mt-3 text-base font-bold text-navy">{t.name}</h2>
                    <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.desc}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t.cost}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.duration}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <OrangeButton className="flex-1 py-2 text-xs">Book Free Consult</OrangeButton>
                      <a
                        href={`/treatments/${t.slug}`}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-navy/20 bg-white/40 px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-white/60"
                      >
                        Know More <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Container>
        </section>

        <section className="bg-cream py-14">
          <Container className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <Eyebrow>Not sure which treatment?</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Talk to a specialist — it's free</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Our care coordinators match you with the right specialist in under 30 minutes. No waiting, no jargon.
              </p>
            </div>
            <ConsultForm />
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
