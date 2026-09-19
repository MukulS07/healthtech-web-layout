import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Star, MapPin, Phone, CheckCircle2, Briefcase, Quote } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, OrangeButton, OutlineButton, Eyebrow } from "@/components/home/primitives";
import { ConsultForm } from "@/components/home/ConsultForm";
import { getDoctorBySlugFn } from "@/lib/server-functions/doctors";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import doctorFallbackImg from "@/assets/doctor-1.jpg";

export const Route = createFileRoute("/doctors/$slug")({
  loader: async ({ params }) => {
    const doctorRes = await getDoctorBySlugFn({ data: params.slug });
    if (!doctorRes.success || !doctorRes.doctor) throw notFound();

    const reviewsRes = await getReviewsFn({
      data: { doctorId: doctorRes.doctor.id, limit: 6 },
    }).catch(() => null);

    return {
      doctor: doctorRes.doctor,
      reviews: reviewsRes?.success ? reviewsRes.reviews : [],
    };
  },
  head: ({ loaderData }) => {
    const doctor = loaderData?.doctor;
    return {
      meta: [
        { title: `${doctor?.name ?? "Doctor"} — ${doctor?.specialty ?? ""} | Go Surgery` },
        {
          name: "description",
          content: `${doctor?.name ?? "Doctor"}, ${doctor?.cred ?? ""}. ${doctor?.exp ?? 0} years experience. Book a free consultation.`,
        },
      ],
    };
  },
  component: DoctorProfile,
});

function DoctorProfile() {
  const { doctor, reviews } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <nav className="border-b border-border bg-cream py-3 text-xs text-muted-foreground">
          <Container className="flex items-center gap-2">
            <a href="/" className="hover:text-brand-orange">
              Home
            </a>
            <span>/</span>
            <a href="/doctors" className="hover:text-brand-orange">
              Doctors
            </a>
            <span>/</span>
            <span className="font-medium text-ink">{doctor.name}</span>
          </Container>
        </nav>

        <section className="bg-navy py-12">
          <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <img
              src={doctor.img || doctorFallbackImg}
              alt={doctor.name}
              loading="lazy"
              width={700}
              height={700}
              className="h-36 w-36 shrink-0 rounded-xl object-cover sm:h-44 sm:w-44"
            />
            <div className="min-w-0">
              <Eyebrow tone="light">{doctor.specialty}</Eyebrow>
              <h1 className="mt-1.5 text-2xl font-bold text-navy-foreground sm:text-3xl">
                {doctor.name}
              </h1>
              <p className="mt-1 text-sm text-navy-foreground/75">{doctor.cred}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                {Number(doctor.rating) > 0 && (
                  <span className="flex items-center gap-1.5 font-semibold text-brand-orange">
                    <Star className="h-4 w-4 fill-brand-orange" /> {doctor.rating}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-navy-foreground/80">
                  <Briefcase className="h-4 w-4 text-brand-orange" /> {doctor.exp} Years Experience
                </span>
                {doctor.city && (
                  <span className="flex items-center gap-1.5 text-navy-foreground/80">
                    <MapPin className="h-4 w-4 text-brand-orange" /> {doctor.city}
                  </span>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/contact">
                  <OrangeButton>Book Consultation</OrangeButton>
                </a>
                <a href="tel:18000001234">
                  <OutlineButton tone="light">
                    <Phone className="h-4 w-4" /> Call Now
                  </OutlineButton>
                </a>
              </div>
            </div>
          </Container>
        </section>

        <Container className="grid gap-10 py-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="min-w-0 space-y-12">
            {doctor.bio && (
              <section>
                <h2 className="text-xl font-bold text-navy">About {doctor.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {doctor.bio}
                </p>
              </section>
            )}

            {doctor.surgeryTypes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">Surgery Types</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {doctor.surgeryTypes.map((t: string) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-ink/80">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-orange" />{" "}
                      {t.replace(/-/g, " ")}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {doctor.languages.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">Languages</h2>
                <div className="mt-3 flex gap-2">
                  {doctor.languages.map((l: string) => (
                    <span
                      key={l}
                      className="rounded-full bg-brand-orange-soft px-3 py-1.5 text-xs font-semibold text-brand-orange-dark"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {doctor.hospitals.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-navy">Practices At</h2>
                <div className="mt-4 space-y-3">
                  {doctor.hospitals.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-cream p-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-navy">{h.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[h.locality, h.city].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      {h.slug && (
                        <Link to="/hospitals/$slug" params={{ slug: h.slug }} className="shrink-0">
                          <OutlineButton className="px-3 py-1.5 text-xs">View</OutlineButton>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHead eyebrow="Patient feedback" title="What Patients Say" />
              {reviews.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-cream p-5">
                      <div className="flex items-center justify-between">
                        <Quote className="h-6 w-6 text-brand-orange" />
                        <span className="flex items-center gap-1 text-xs font-bold text-navy">
                          <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{" "}
                          {r.rating}
                        </span>
                      </div>
                      <p className="mt-3 text-sm italic text-ink/80">"{r.comment}"</p>
                      <p className="mt-3 text-xs font-semibold text-navy">— {r.patientName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No reviews for this doctor yet.</p>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ConsultForm />
            {doctor.fees > 0 && (
              <div className="rounded-lg border border-border bg-cream p-4">
                <p className="text-sm font-semibold text-navy">Consultation fee</p>
                <p className="mt-2 text-lg font-bold text-brand-orange">₹{doctor.fees}</p>
              </div>
            )}
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
