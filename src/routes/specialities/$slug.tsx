import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { canonicalSpecialitySlug, getSpeciality } from "@/data/catalog";
import { loadSpecialityData, SpecialityPage, specialityHead } from "@/components/care/SpecialityPage";

export const Route = createFileRoute("/specialities/$slug")({
  loader: async ({ params }) => {
    const spec = getSpeciality(params.slug);
    if (!spec) throw notFound();
    // Old/alias slugs (e.g. "orthopedics") permanently redirect to the canonical one.
    if (spec.slug !== params.slug) {
      throw redirect({ to: "/specialities/$slug", params: { slug: canonicalSpecialitySlug(params.slug)! }, statusCode: 301 });
    }
    return { slug: spec.slug, data: await loadSpecialityData(spec) };
  },
  head: ({ loaderData, match }) => {
    const spec = loaderData ? getSpeciality(loaderData.slug) : undefined;
    return spec ? specialityHead(spec, undefined, loaderData?.data, match.context.locale) : {};
  },
  component: SpecialityRoute,
});

function SpecialityRoute() {
  const { slug, data } = Route.useLoaderData();
  return <SpecialityPage spec={getSpeciality(slug)!} data={data} />;
}
