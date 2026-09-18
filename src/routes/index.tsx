import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/home/Footer";
import {
  FindCare,
  PatientExperiences,
  Hospitals,
  Journey,
  Doctors,
  Stats,
  Insurance,
  Testimonials,
  About,
  Healthfeed,
  Faq,
  DownloadApp,
} from "@/components/home/Sections";
import { getDoctorsFn } from "@/lib/server-functions/doctors";
import { getHospitalsFn } from "@/lib/server-functions/hospitals";

const title = "Go Surgery | Thoughtful Health Support";
const description =
  "Connect with trusted specialists, modern hospitals and a dedicated care team for clear guidance from consultation through recovery.";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [doctorsRes, hospitalsRes] = await Promise.all([
      getDoctorsFn({ data: { limit: 8, sort: "Rating: High to Low" } }).catch(() => null),
      getHospitalsFn({ data: { limit: 8 } }).catch(() => null),
    ]);
    return {
      doctors: doctorsRes?.success ? doctorsRes.doctors : [],
      hospitals: hospitalsRes?.success ? hospitalsRes.hospitals : [],
    };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { doctors, hospitals } = Route.useLoaderData();
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Hero />
        <FindCare />
        <PatientExperiences />
        <Hospitals hospitals={hospitals} />
        <Journey />
        <Doctors doctors={doctors} />
        <Stats />
        <Insurance />
        <Testimonials />
        <About />
        <Healthfeed />
        <Faq />
        <DownloadApp />
      </main>
      <Footer />
    </div>
  );
}
