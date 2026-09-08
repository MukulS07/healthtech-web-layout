import { createFileRoute } from "@tanstack/react-router";
import { Star, MapPin, Phone, CheckCircle2, GraduationCap, Briefcase, Quote } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import doctor1 from "@/assets/doctor-1.jpg";
import doctor2 from "@/assets/doctor-2.jpg";

type DoctorInfo = {
  name: string;
  specialty: string;
  cred: string;
  exp: string;
  rating: string;
  reviews: number;
  city: string;
  img: string;
  about: string;
  education: { degree: string; institution: string; year: string }[];
  expertise: string[];
  treatments: string[];
  languages: string[];
  testimonials: { quote: string; patient: string; treatment: string }[];
};

const doctorData: Record<string, DoctorInfo> = {
  "dr-ananya-rao": {
    name: "Dr. Ananya Rao",
    specialty: "Gynaecologist & Laparoscopic Surgeon",
    cred: "MBBS, MS (Obstetrics & Gynaecology)",
    exp: "14 Years",
    rating: "4.8",
    reviews: 312,
    city: "Delhi NCR",
    img: doctor1,
    about: "Dr. Ananya Rao is a senior gynaecologist and laparoscopic surgeon with 14 years of experience. She specialises in minimally invasive gynaecological procedures and high-risk obstetrics. She completed her surgical fellowship at AIIMS and has performed over 3,000 laparoscopic procedures.",
    education: [
      { degree: "MBBS", institution: "Lady Hardinge Medical College, New Delhi", year: "2008" },
      { degree: "MS (Obstetrics & Gynaecology)", institution: "AIIMS, New Delhi", year: "2012" },
      { degree: "Fellowship in Minimally Invasive Gynaecology", institution: "Apollo Hospitals, Hyderabad", year: "2013" },
    ],
    expertise: ["Laparoscopic Hysterectomy", "Fibroid Removal (Myomectomy)", "Endometriosis Treatment", "Ovarian Cyst Removal", "PCOS Management", "High-Risk Pregnancy Care"],
    treatments: ["Hysterectomy", "Fibroid Removal", "Ovarian Cyst", "Ectopic Pregnancy", "Sterilisation"],
    languages: ["Hindi", "English", "Telugu"],
    testimonials: [
      { quote: "Dr. Ananya explained every step of my fibroid surgery. I was discharged in 24 hours and had no pain. Highly recommend.", patient: "Priya M.", treatment: "Fibroid Removal • Delhi NCR" },
      { quote: "My hysterectomy was done laparoscopically. I was terrified but Dr. Rao made me completely comfortable.", patient: "Savita R.", treatment: "Hysterectomy • Gurgaon" },
    ],
  },
};

const fallbackDoctor: DoctorInfo = {
  name: "Dr. Specialist",
  specialty: "Specialist Surgeon",
  cred: "MBBS, MS (Surgery)",
  exp: "12 Years",
  rating: "4.7",
  reviews: 128,
  city: "Delhi NCR",
  img: doctor2,
  about: "An experienced specialist surgeon with over a decade of clinical practice. Focused on minimally invasive techniques, patient education and holistic recovery support.",
  education: [
    { degree: "MBBS", institution: "Government Medical College", year: "2006" },
    { degree: "MS (Surgery)", institution: "Regional PG Institute", year: "2010" },
  ],
  expertise: ["Minimally Invasive Surgery", "Laparoscopic Procedures", "Day-Care Surgeries", "Post-op Recovery"],
  treatments: ["Primary Procedure", "Advanced Technique", "Corrective Surgery"],
  languages: ["Hindi", "English"],
  testimonials: [
    { quote: "The doctor was thorough, kind and kept me informed. Recovery was smooth.", patient: "Patient A.", treatment: "Surgical Procedure • Delhi NCR" },
  ],
};

export const Route = createFileRoute("/doctors/$slug")({
  head: ({ params }) => {
    const data = doctorData[params.slug] ?? fallbackDoctor;
    return {
      meta: [
        { title: `${data.name} — ${data.specialty} | Prime Care` },
        { name: "description", content: `${data.name}, ${data.cred}. ${data.exp} experience. Book a free consultation.` },
      ],
    };
  },
  component: DoctorProfile,
});

function DoctorProfile() {
  const { slug } = Route.useParams();
  const data = doctorData[slug] ?? fallbackDoctor;

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">Home</a>
            <span>/</span>
            <a href="/doctors" className="hover:text-brand-orange">Doctors</a>
            <span>/</span>
            <span className="font-medium text-ink">{data.name}</span>
          </Container>
        </nav>

        {/* Doctor hero */}
        <section className="bg-navy py-12">
          <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <img
              src={data.img}
              alt={data.name}
              loading="lazy"
              width={700}
              height={700}
              className="h-36 w-36 shrink-0 rounded-xl object-cover sm:h-44 sm:w-44"
            />
            <div className="min-w-0">
              <Eyebrow tone="light">{data.specialty}</Eyebrow>
              <h1 className="mt-1.5 text-2xl font-bold text-navy-foreground sm:text-3xl">{data.name}</h1>
              <p className="mt-1 text-sm text-navy-foreground/75">{data.cred}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-brand-orange">
                  <Star className="h-4 w-4 fill-brand-orange" /> {data.rating} ({data.reviews} reviews)
                </span>
                <span className="flex items-center gap-1.5 text-navy-foreground/80">
                  <Briefcase className="h-4 w-4 text-brand-orange" /> {data.exp} Experience
                </span>
                <span className="flex items-center gap-1.5 text-navy-foreground/80">
                  <MapPin className="h-4 w-4 text-brand-orange" /> {data.city}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <OrangeButton>Book Consultation</OrangeButton>
                <OutlineButton tone="light">
                  <Phone className="h-4 w-4" /> Call Now
                </OutlineButton>
              </div>
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
              <h2 className="text-xl font-bold text-navy">Areas of Expertise</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {data.expertise.map((e) => (
                  <li key={e} className="flex items-center gap-2 text-sm text-ink/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-orange" /> {e}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Education & Training</h2>
              <div className="mt-4 space-y-4">
                {data.education.map((e) => (
                  <div key={e.degree} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-navy-foreground">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="mt-1 w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-navy">{e.degree}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{e.institution}</p>
                      <p className="mt-0.5 text-xs text-brand-orange">{e.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Treatments Offered</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.treatments.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-cream px-4 py-2 text-sm font-medium text-ink/80">
                    {t}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-navy">Languages</h2>
              <div className="mt-3 flex gap-2">
                {data.languages.map((l) => (
                  <span key={l} className="rounded-full bg-brand-orange-soft px-3 py-1.5 text-xs font-semibold text-brand-orange-dark">{l}</span>
                ))}
              </div>
            </section>

            <section>
              <SectionHead eyebrow="Patient feedback" title="What Patients Say" />
              <div className="grid gap-4 sm:grid-cols-2">
                {data.testimonials.map((t) => (
                  <div key={t.patient} className="rounded-lg border border-border bg-cream p-5">
                    <Quote className="h-6 w-6 text-brand-orange" />
                    <p className="mt-3 text-sm italic text-ink/80">"{t.quote}"</p>
                    <p className="mt-3 text-xs font-semibold text-navy">— {t.patient}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.treatment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            <div className="rounded-lg border border-border bg-cream p-4">
              <p className="text-sm font-semibold text-navy">Clinic timings</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex justify-between"><span>Monday – Friday</span><span className="font-medium text-ink">9:00 AM – 6:00 PM</span></li>
                <li className="flex justify-between"><span>Saturday</span><span className="font-medium text-ink">9:00 AM – 2:00 PM</span></li>
                <li className="flex justify-between"><span>Sunday</span><span className="font-medium text-ink">By appointment</span></li>
              </ul>
            </div>
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
