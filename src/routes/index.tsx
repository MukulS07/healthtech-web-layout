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

const title = "Prime Care | Thoughtful Health Support";
const description =
  "Connect with trusted specialists, modern hospitals and a dedicated care team for clear guidance from consultation through recovery.";

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
