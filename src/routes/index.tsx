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

const title = "Prime Care: Specialist Surgeons | Modern Hospitals | Safer Surgeries";
const description =
  "Book a free consultation with specialist surgeons for 50+ conditions. Cashless surgery on 100+ insurers, free pick-up and drop, and dedicated recovery support across 45+ cities.";

export const Route = createFileRoute("/")({
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
  return (
    <div className="bg-background">
      <Header />
      <main>
        <Hero />
        <FindCare />
        <PatientExperiences />
        <Hospitals />
        <Journey />
        <Doctors />
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
