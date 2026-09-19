import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSpeciality } from "@/data/catalog";
import { cityBySlug, loadSpecialityData, SpecialityPage, specialityHead } from "@/components/care/SpecialityPage";

/** City × speciality landing page, e.g. /specialities/proctology/delhi-ncr. */
export const Route = createFileRoute("/specialities/$slug_/$city")({
  loader: async ({ params }) => {
    const spec = getSpeciality(params.slug);
    const city = cityBySlug(params.city);
    if (!spec || spec.slug !== params.slug || !city) throw notFound();
    return { slug: spec.slug, citySlug: city.slug, data: await loadSpecialityData(spec, city.name) };
  },
  head: ({ loaderData }) => {
    const spec = loaderData ? getSpeciality(loaderData.slug) : undefined;
    const city = cityBySlug(loaderData?.citySlug);
    return spec && city ? specialityHead(spec, city, loaderData?.data) : {};
  },
  component: SpecialityCityRoute,
});

function SpecialityCityRoute() {
  const { slug, citySlug, data } = Route.useLoaderData();
  return <SpecialityPage spec={getSpeciality(slug)!} citySlug={citySlug} data={data} />;
}
