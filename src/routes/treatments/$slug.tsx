import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, CheckCircle2, Star, Phone } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, OrangeButton, OutlineButton, Carousel, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";

type TreatmentInfo = {
  name: string;
  specialty: string;
  headline: string;
  about: string;
  symptoms: string[];
  causes: string[];
  procedures: { name: string; desc: string; tag: string }[];
  costMin: string;
  costMax: string;
  successRate: string;
  dischargeTime: string;
  faqs: { q: string; a: string }[];
};

const treatmentData: Record<string, TreatmentInfo> = {
  "piles-surgery": {
    name: "Piles Surgery",
    specialty: "Proctology",
    headline: "Advanced laser treatment for haemorrhoids with same-day discharge.",
    about: "Piles (haemorrhoids) are swollen veins in or around the rectum. Our laser proctoplasty procedure offers a painless, scarless alternative to traditional surgery — most patients return home the same day and are back at work within 3 days.",
    symptoms: ["Bleeding during bowel movements", "Pain or discomfort around the anus", "Itching or irritation", "Swelling around the anus", "Leakage of faeces", "Mucus discharge"],
    causes: ["Chronic constipation or diarrhoea", "Low-fibre diet", "Prolonged sitting on the toilet", "Pregnancy", "Heavy lifting", "Obesity"],
    procedures: [
      { name: "Laser Proctoplasty", desc: "A focused laser beam shrinks the haemorrhoid tissue. No incisions, minimal pain, quick recovery.", tag: "Most Popular" },
      { name: "MIPH (Stapler)", desc: "A circular stapler removes excess rectal tissue and repositions the haemorrhoids. Suitable for Grade 3 & 4.", tag: "Grade 3–4" },
      { name: "Open Haemorrhoidectomy", desc: "Traditional surgical removal under anaesthesia. Reserved for severe or recurring cases.", tag: "Severe Cases" },
    ],
    costMin: "₹30,000",
    costMax: "₹60,000",
    successRate: "98%",
    dischargeTime: "Same day",
    faqs: [
      { q: "Is piles surgery painful?", a: "Laser piles surgery is nearly painless. Most patients report only mild discomfort for 1–2 days after the procedure." },
      { q: "How long does recovery take?", a: "Most patients return to desk work within 2–3 days and resume full activity within a week." },
      { q: "Will my insurance cover it?", a: "Yes, piles surgery is covered by most health insurance plans. Our insurance desk confirms your coverage within 30 minutes." },
      { q: "Can piles come back after surgery?", a: "Laser treatment has a recurrence rate below 2%. Following post-operative diet advice significantly reduces the risk." },
    ],
  },
};

const fallback: TreatmentInfo = {
  name: "Surgical Treatment",
  specialty: "General Surgery",
  headline: "Expert minimally invasive surgery with fast recovery and cashless support.",
  about: "Our specialists use the latest minimally invasive techniques to ensure safe, effective treatment with minimal downtime. Every patient has a dedicated care coordinator from consultation to recovery.",
  symptoms: ["Pain or discomfort", "Swelling or inflammation", "Difficulty with normal activity", "Recurring symptoms despite medication"],
  causes: ["Lifestyle factors", "Genetic predisposition", "Chronic medical conditions", "Age-related changes"],
  procedures: [
    { name: "Minimally Invasive", desc: "Laparoscopic or laser approach for most patients. Small incisions, fast recovery.", tag: "Recommended" },
    { name: "Standard Surgical", desc: "Open surgical approach for complex presentations.", tag: "Complex Cases" },
    { name: "Day-Care Procedure", desc: "Same-day discharge where clinically appropriate.", tag: "Fast Recovery" },
  ],
  costMin: "₹30,000",
  costMax: "₹1,50,000",
  successRate: "97%",
  dischargeTime: "24–48 hrs",
  faqs: [
    { q: "Is the consultation free?", a: "Yes. Your first specialist consultation, including diagnosis and treatment planning, is completely free." },
    { q: "Does insurance cover this?", a: "We are cashless on 100+ insurers. Our desk confirms coverage within 30 minutes of receiving your policy details." },
    { q: "How long is the recovery?", a: "Most minimally invasive procedures allow discharge within 24 hours and return to routine in 3–7 days." },
  ],
};

const doctors = [
  { name: "Dr. Karan Mehta", cat: "Laparoscopic Surgeon", cred: "MBBS, MS (General Surgery)", exp: "11 Years", rating: "4.9", img: doctor3 },
  { name: "Dr. Pradeep Dutta", cat: "General Surgeon", cred: "MBBS, MD (Surgery)", exp: "27 Years", rating: "4.5", img: doctor2 },
  { name: "Dr. Ananya Rao", cat: "Specialist Surgeon", cred: "MBBS, MS, FAIS", exp: "14 Years", rating: "4.8", img: doctor1 },
];

const benefits = [
  "Free first consultation",
  "Cashless insurance support",
  "Free pick-up & drop on surgery day",
  "24x7 post-op care coordinator",
];

export const Route = createFileRoute("/treatments/$slug")({
  head: ({ params }) => {
    const data = treatmentData[params.slug] ?? fallback;
    return {
      meta: [
        { title: `${data.name} | Prime Care` },
        { name: "description", content: data.headline },
      ],
    };
  },
  component: TreatmentDetail,
});

function TreatmentDetail() {
  const { slug } = Route.useParams();
  const data = treatmentData[slug] ?? fallback;
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <a href="/treatments" className="hover:text-brand-orange">Treatments</a>
            <span>/</span>
            <span className="font-medium text-ink">{data.name}</span>
          </Container>
        </nav>

        <section className="bg-navy py-12">
          <Container>
            <span className="inline-block rounded-full bg-brand-orange-soft px-3 py-1 text-[11px] font-semibold text-brand-orange-dark">
              {data.specialty}
            </span>
            <h1 className="mt-3 text-3xl font-bold text-navy-foreground sm:text-4xl">{data.name}</h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/80 sm:text-base">{data.headline}</p>
            <div className="mt-6 flex flex-wrap gap-8">
              {[
                { label: "Success Rate", value: data.successRate },
                { label: "Discharge", value: data.dischargeTime },
                { label: "Starting at", value: data.costMin },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-brand-orange">{s.value}</p>
                  <p className="mt-0.5 text-xs text-navy-foreground/70">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            <section>
              <h2 className="text-xl font-bold text-navy">About {data.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{data.about}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Symptoms</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.symptoms.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" /> {s}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Common Causes</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.causes.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-ink/80">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" /> {c}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Procedure Types</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {data.procedures.map((p) => (
                  <div key={p.name} className="rounded-lg border border-border bg-cream p-4">
                    <span className="inline-block rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold text-navy-foreground">
                      {p.tag}
                    </span>
                    <h3 className="mt-2 text-sm font-bold text-navy">{p.name}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-cream p-6">
              <Eyebrow>Estimated cost</Eyebrow>
              <p className="mt-2 text-3xl font-extrabold text-brand-orange">{data.costMin} – {data.costMax}</p>
              <p className="mt-1 text-sm text-muted-foreground">Varies by city, facility and procedure type. Cashless on 100+ insurers.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <OrangeButton>Check My Insurance</OrangeButton>
                <OutlineButton>Get Cost Estimate</OutlineButton>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Specialist Surgeons</h2>
              <Carousel className="mt-5">
                {doctors.map((d) => (
                  <article key={d.name} className="w-[240px] shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-background sm:w-[280px]">
                    <div className="relative">
                      <img src={d.img} alt={d.name} loading="lazy" width={700} height={700} className="h-48 w-full object-cover" />
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

            <section>
              <h2 className="text-xl font-bold text-navy">Frequently Asked Questions</h2>
              <div className="mt-4 space-y-3">
                {data.faqs.map((f, i) => (
                  <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-cream">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-navy">{f.q}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-brand-orange transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <p className="px-5 pb-4 text-sm text-muted-foreground">{f.a}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            <div className="rounded-lg border border-border bg-cream p-4">
              <p className="text-sm font-semibold text-navy">Why choose Prime Care?</p>
              <ul className="mt-3 space-y-2">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-ink/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-orange" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
