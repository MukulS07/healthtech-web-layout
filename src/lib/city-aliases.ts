/**
 * Real `Doctor.location`/`Hospital.city` values that should roll up under a combined display
 * city like "Delhi NCR" — the real prod data records NCR satellite cities separately (confirmed
 * via direct aggregation against prod-sixdoctar, 2026-09-19), it doesn't use a combined
 * "Delhi NCR" value the way our own City model/Footer list does. Shared by cities.ts, doctors.ts,
 * and hospitals.ts so city filters actually match real documents instead of silently returning
 * zero results for "Delhi NCR".
 */
export const CITY_LOCATION_ALIASES: Record<string, string[]> = {
  "Delhi NCR": ["Delhi", "New Delhi", "Gurugram", "Gurgaon", "Noida", "Ghaziabad", "Faridabad"],
};

export function locationValuesFor(cityName: string): string[] {
  return CITY_LOCATION_ALIASES[cityName] || [cityName];
}

const DISPLAY_FOR_LOCATION = new Map(
  Object.entries(CITY_LOCATION_ALIASES).flatMap(([display, locations]) =>
    locations.map((l) => [l.toLowerCase(), display] as const),
  ),
);

/** The display city a raw location rolls up to ("Gurugram" → "Delhi NCR"; others unchanged). */
export function displayCityFor(location: string): string {
  return DISPLAY_FOR_LOCATION.get(location.trim().toLowerCase()) ?? location.trim();
}
