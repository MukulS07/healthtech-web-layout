import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { Container, SectionHead, Eyebrow } from "@/components/home/primitives";
import { getCitiesFn } from "@/lib/server-functions/cities";
import { seo } from "@/lib/seo";

const bgGradients = [
  "from-blue-50 to-slate-50",
  "from-orange-50 to-amber-50",
  "from-green-50 to-teal-50",
  "from-purple-50 to-indigo-50",
];

export const Route = createFileRoute("/locations/")({
  loader: async () => {
    try {
      return await getCitiesFn();
    } catch {
      return { success: false, cities: [] };
    }
  },
  head: ({ match }) =>
    seo({ locale: match.context.locale,
      title: "Locations — Cities We Serve",
      description:
        "Find surgeons and hospitals in Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Pune and more cities across India.",
      path: "/locations",
    }),
  component: LocationsPage,
});

function LocationsPage() {
  const { cities } = Route.useLoaderData();

  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-navy py-14">
          <Container>
            <Eyebrow tone="light">Our presence</Eyebrow>
            <h1 className="mt-2 text-3xl font-bold text-navy-foreground sm:text-4xl">
              Find Care Near You
            </h1>
            <p className="mt-3 max-w-xl text-sm text-navy-foreground/75 sm:text-base">
              Specialist surgeons and hospitals across India.
            </p>
          </Container>
        </section>

        <section className="py-14">
          <Container>
            <SectionHead
              eyebrow="Our presence"
              title="Cities We Serve"
              subtitle="Click any city to see the hospitals, doctors and specialities available there."
            />
            {cities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cities available yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cities.map((city, i) => (
                  <Link
                    key={city.slug}
                    to="/locations/$city"
                    params={{ city: city.slug }}
                    className={`group flex flex-col rounded-xl border border-border bg-gradient-to-br ${bgGradients[i % bgGradients.length]} p-5 transition-shadow hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-navy/10">
                        <MapPin className="h-5 w-5 text-navy" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-orange opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <h2 className="mt-4 text-base font-bold text-navy">{city.name}</h2>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-lg font-extrabold text-brand-orange">
                          {city.hospitalCount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Hospitals listed</p>
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-brand-orange">
                          {city.doctorCount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Surgeons listed</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
