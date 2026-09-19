import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Doctor } from "@/models/Doctor";
import { locationValuesFor } from "@/lib/city-aliases";
import { CITIES } from "@/lib/site";
import { NON_PERSON_NAME_PATTERN, SPECIALITIES, SURGICAL_DOCTOR_MATCH } from "@/data/catalog";
import { getDoctorFacetsFn } from "./doctors";
import { getHospitalFacetsFn } from "./hospitals";

/**
 * Cities come from the site's own city list (src/lib/site.ts CITIES), not the `City` collection.
 * The collection-based version 404'd for any city missing from a given database (e.g.
 * /locations/delhi-ncr, linked from every page's footer) and triggered the sample-data seeder on
 * a production database. Counts are real: surgical doctors and hospitals from the cached facets.
 */
export const getCitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const [doctorFacets, hospitalFacets] = await Promise.all([getDoctorFacetsFn(), getHospitalFacetsFn()]);
    const doctorsByCity = new Map((doctorFacets.success ? doctorFacets.cities : []).map((c) => [c.name, c.count]));
    const hospitalsByCity = new Map((hospitalFacets.success ? hospitalFacets.cities : []).map((c) => [c.name, c.count]));
    return {
      success: true as const,
      cities: CITIES.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        state: "",
        tagline: "",
        doctorCount: doctorsByCity.get(c.name) ?? 0,
        hospitalCount: hospitalsByCity.get(c.name) ?? 0,
        specialtyCount: 0,
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, cities: [], error: errMessage };
  }
});

/**
 * One city's real stats plus which catalog specialities its surgeons cover (with counts) — instead
 * of the raw, junk-filled distinct `specialization` dump ("Charity", "Corporate Office", "Cancer
 * Surgeon In Bhayandar"...) the page used to render.
 */
export const getCityBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    try {
      const city = CITIES.find((c) => c.slug === slug);
      if (!city) return { success: false as const, error: "City not found" };

      await connectToDatabase();
      const locations = locationValuesFor(city.name);
      const notOrg = new RegExp(NON_PERSON_NAME_PATTERN, "i");
      const [bySpec, hospitalFacets] = await Promise.all([
        Doctor.aggregate<{ _id: string; n: number }>([
          {
            $match: {
              isActive: { $ne: false },
              location: { $in: locations },
              specialization: { $regex: SURGICAL_DOCTOR_MATCH, $options: "i" },
              firstName: { $not: notOrg },
            },
          },
          { $group: { _id: { $toLower: "$specialization" }, n: { $sum: 1 } } },
        ]),
        getHospitalFacetsFn(),
      ]);

      const specialities = SPECIALITIES.map((s) => {
        const re = new RegExp(s.doctorMatch, "i");
        return { slug: s.slug, name: s.name, count: bySpec.reduce((sum, r) => (r._id && re.test(r._id) ? sum + r.n : sum), 0) };
      })
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count);

      return {
        success: true as const,
        city: {
          id: city.slug,
          name: city.name,
          slug: city.slug,
          state: "",
          doctorCount: bySpec.reduce((sum, r) => sum + r.n, 0),
          hospitalCount: hospitalFacets.success ? (hospitalFacets.cities.find((c) => c.name === city.name)?.count ?? 0) : 0,
          specialities,
          locationValues: locations,
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
