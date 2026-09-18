import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { City } from "@/models/City";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { seedDatabaseFn } from "./seed";

/**
 * Server function to list active cities with live doctor/hospital counts, so /locations and
 * city filter dropdowns can be driven from real data instead of a hardcoded string list.
 */
export const getCitiesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();

    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      await seedDatabaseFn();
    }

    const cities = await City.find({ isActive: true }).sort({ name: 1 }).lean();

    const [doctorCounts, hospitalCounts] = await Promise.all([
      Doctor.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$city", count: { $sum: 1 } } },
      ]),
      Hospital.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$city", count: { $sum: 1 } } },
      ]),
    ]);

    const doctorCountByCity = new Map(doctorCounts.map((c) => [c._id, c.count]));
    const hospitalCountByCity = new Map(hospitalCounts.map((c) => [c._id, c.count]));

    return {
      success: true as const,
      cities: cities.map((c) => ({
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        state: c.state || "",
        tagline: c.tagline || "",
        doctorCount: doctorCountByCity.get(c.name) || 0,
        hospitalCount: hospitalCountByCity.get(c.name) || 0,
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, cities: [], error: errMessage };
  }
});
