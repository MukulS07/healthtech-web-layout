import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/home/Footer";
import {
  FindCare,
  SpecialisedCentres,
  PatientExperiences,
  Hospitals,
  Journey,
  Doctors,
  Stats,
  Benefits,
  Insurance,
  Testimonials,
  About,
  Healthfeed,
  Faq,
  HOME_FAQS,
  JoinCommunity,
} from "@/components/home/Sections";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";
import { getReviewsFn } from "@/lib/server-functions/reviews";
import { getSiteStatsFn } from "@/lib/server-functions/site-stats";
import { seo, faqLd, organizationLd } from "@/lib/seo";
import { CONSULT_PHRASE, SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [doctorsRes, hospitalsRes, reviewsRes, statsRes] = await Promise.all([
      getDoctorsFn({ data: { limit: 8, sort: "Rating: High to Low" } }).catch(() => null),
      getHospitalsFn({ data: { limit: 8 } }).catch(() => null),
      getReviewsFn({ data: { minRating: 4, limit: 6 } }).catch(() => null),
      getSiteStatsFn().catch(() => null),
    ]);
    return {
      doctors: doctorsRes?.success ? doctorsRes.doctors : [],
      hospitals: hospitalsRes?.success ? hospitalsRes.hospitals : [],
      testimonials: reviewsRes?.success ? reviewsRes.reviews : [],
      stats: statsRes?.success ? statsRes : null,
    };
  },
  head: () =>
    seo({
      title: `${SITE.name} — Find Surgeons, Treatments & Specialists`,
      description:
        `Find experienced surgeons near you, understand your treatment options, and get help with insurance. Book ${CONSULT_PHRASE} with Go Surgery — no account needed.`,
      path: "/",
      jsonLd: [
        organizationLd,
        { "@type": "WebSite", name: SITE.name, url: SITE.url },
        faqLd(HOME_FAQS),
      ],
    }),
  component: Index,
});

function Index() {
  const { doctors, hospitals, testimonials, stats } = Route.useLoaderData();
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Hero stats={stats} />
        <FindCare />
        <SpecialisedCentres />
        <Benefits />
        <Doctors doctors={doctors} />
        <Journey />
        <Hospitals hospitals={hospitals} />
        <PatientExperiences />
        <Stats stats={stats} />
        <Testimonials
          testimonials={testimonials}
          summary={stats && stats.reviews > 0 && stats.averageRating ? { averageRating: stats.averageRating, totalReviews: stats.reviews } : null}
        />
        <Insurance />
        <About />
        <Healthfeed />
        <Faq />
        <JoinCommunity />
      </main>
      <Footer />
    </div>
  );
}
