import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { City } from "@/models/City";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { seedDatabaseFn } from "./seed";
import { locationValuesFor } from "@/lib/city-aliases";

/**
 * Server function to list active cities with live doctor/hospital counts, so /locations and
 * city filter dropdowns can be driven from real data instead of a hardcoded string list.
 *
 * Fixed 2026-09-19: this previously grouped `Doctor` documents by `$city`, a field that stopped
 * existing when the Doctor schema was rewritten to match real prod data (2026-09-18) — the real
 * field is `location`. That bug meant every city always showed 0 real doctors; it went unnoticed
 * because `/locations` never actually called this function (it used its own hardcoded array
 * instead) until this fix wired it in for real.
 */
export const getCitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();

    // Idempotent — only inserts cities/hospitals/doctors/treatments that don't already exist
    // (see seed.ts), so this is safe to call every time rather than only when City is empty.
    await seedDatabaseFn();

    const cities = await City.find({ isActive: true }).sort({ name: 1 }).lean();

    const [doctorCounts, hospitalCounts, specialtySets] = await Promise.all([
      Doctor.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$location", count: { $sum: 1 } } },
      ]),
      Hospital.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$city", count: { $sum: 1 } } },
      ]),
      Doctor.aggregate<{ _id: string; specialties: string[] }>([
        { $match: { specialization: { $ne: null } } },
        { $group: { _id: "$location", specialties: { $addToSet: "$specialization" } } },
      ]),
    ]);

    const doctorCountByLocation = new Map(doctorCounts.map((c) => [c._id, c.count]));
    const hospitalCountByLocation = new Map(hospitalCounts.map((c) => [c._id, c.count]));
    const specialtiesByLocation = new Map(specialtySets.map((c) => [c._id, c.specialties]));

    const sumFor = (map: Map<string, number>, cityName: string) =>
      locationValuesFor(cityName).reduce((sum, loc) => sum + (map.get(loc) || 0), 0);

    const specialtyCountFor = (cityName: string) => {
      const set = new Set<string>();
      for (const loc of locationValuesFor(cityName)) {
        for (const s of specialtiesByLocation.get(loc) || []) set.add(s);
      }
      return set.size;
    };

    return {
      success: true as const,
      cities: cities.map((c) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        state: c.state || "",
        tagline: c.tagline || "",
        doctorCount: sumFor(doctorCountByLocation, c.name),
        hospitalCount: sumFor(hospitalCountByLocation, c.name),
        specialtyCount: specialtyCountFor(c.name),
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, cities: [], error: errMessage };
  }
});

/**
 * Server function to fetch a single city's real stats plus the specialities its doctors
 * actually cover, for the /locations/$slug detail page. Doctor/hospital listings for the page
 * are fetched separately via the existing getDoctorsFn/getHospitalsFn (city filter already
 * handles the same NCR alias mapping via locationValuesFor below).
 */
export const getCityBySlugFn = createServerFn({ method: "GET" })
  .validator((slug: unknown) => String(slug))
  .handler(async ({ data: slug }) => {
    try {
      await connectToDatabase();
      const city = await City.findOne({ slug }).lean();
      if (!city) {
        return { success: false as const, error: "City not found" };
      }

      const locations = locationValuesFor(city.name);
      const [doctorCount, hospitalCount, specialities] = await Promise.all([
        Doctor.countDocuments({ location: { $in: locations }, isActive: { $ne: false } }),
        Hospital.countDocuments({ city: { $in: locations }, isActive: { $ne: false } }),
        Doctor.distinct("specialization", { location: { $in: locations } }),
      ]);

      return {
        success: true as const,
        city: {
          id: String(city._id),
          name: city.name,
          slug: city.slug,
          state: city.state || "",
          doctorCount,
          hospitalCount,
          specialities: specialities.filter(Boolean).sort(),
          locationValues: locations,
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
