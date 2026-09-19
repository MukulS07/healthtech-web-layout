import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { requireAdminUser } from "@/lib/auth";
import { Doctor } from "@/models/Doctor";
import { Hospital } from "@/models/Hospital";
import { Treatment } from "@/models/Treatment";
import { City } from "@/models/City";

const initialCities = [
  { name: "Delhi NCR", slug: "delhi-ncr", state: "Delhi / Haryana / UP" },
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
  { name: "Bangalore", slug: "bangalore", state: "Karnataka" },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu" },
  { name: "Pune", slug: "pune", state: "Maharashtra" },
  { name: "Kolkata", slug: "kolkata", state: "West Bengal" },
  { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat" },
  { name: "Jaipur", slug: "jaipur", state: "Rajasthan" },
  { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh" },
  { name: "Kochi", slug: "kochi", state: "Kerala" },
  { name: "Indore", slug: "indore", state: "Madhya Pradesh" },
];

const initialDoctors = [
  {
    name: "Dr. Ananya Rao",
    slug: "dr-ananya-rao",
    specialty: "Gynaecology",
    cred: "MBBS, MS (Obstetrics & Gynaecology)",
    exp: 14,
    rating: "4.8",
    city: "Delhi NCR",
    hospital: "Max Super Speciality Hospital",
    fees: 800,
    languages: ["Hindi", "English"],
    treatmentSlugs: [],
  },
  {
    name: "Dr. Pradeep Dutta",
    slug: "dr-pradeep-dutta",
    specialty: "Laparoscopy",
    cred: "MBBS, MD (Respiratory Medicine)",
    exp: 27,
    rating: "4.5",
    city: "Mumbai",
    hospital: "Fortis Hospital",
    fees: 1000,
    languages: ["Hindi", "English", "Marathi"],
    treatmentSlugs: ["gallstone"],
  },
  {
    name: "Dr. Karan Mehta",
    slug: "dr-karan-mehta",
    specialty: "Laparoscopy",
    cred: "MBBS, MS (General Surgery)",
    exp: 11,
    rating: "4.9",
    city: "Bangalore",
    hospital: "Manipal Hospital",
    fees: 750,
    languages: ["English", "Kannada", "Hindi"],
    treatmentSlugs: ["hernia"],
  },
  {
    name: "Dr. Sunita Narang",
    slug: "dr-sunita-narang",
    specialty: "Ophthalmology",
    cred: "MBBS, MS (Ophthalmology)",
    exp: 18,
    rating: "4.7",
    city: "Hyderabad",
    hospital: "Apollo Hospitals",
    fees: 900,
    languages: ["Hindi", "English", "Telugu"],
    treatmentSlugs: [],
  },
  {
    name: "Dr. Ravi Shankar",
    slug: "dr-ravi-shankar",
    specialty: "Orthopedics",
    cred: "MBBS, MS (Orthopaedics), DNB",
    exp: 22,
    rating: "4.8",
    city: "Chennai",
    hospital: "Apollo Hospitals",
    fees: 1100,
    languages: ["Tamil", "English"],
    treatmentSlugs: [],
  },
  {
    name: "Dr. Meena Pillai",
    slug: "dr-meena-pillai",
    specialty: "ENT",
    cred: "MBBS, MS (ENT)",
    exp: 16,
    rating: "4.6",
    city: "Kochi",
    hospital: "Aster Medcity",
    fees: 700,
    languages: ["Malayalam", "English"],
    treatmentSlugs: [],
  },
  {
    name: "Dr. Alok Verma",
    slug: "dr-alok-verma",
    specialty: "Urology",
    cred: "MBBS, MS, MCh (Urology)",
    exp: 19,
    rating: "4.9",
    city: "Delhi NCR",
    hospital: "Medanta - The Medicity",
    fees: 1200,
    languages: ["Hindi", "English"],
    treatmentSlugs: ["kidney-stone"],
  },
  {
    name: "Dr. Pooja Sharma",
    slug: "dr-pooja-sharma",
    specialty: "Proctology",
    cred: "MBBS, MS (General Surgery)",
    exp: 12,
    rating: "4.7",
    city: "Pune",
    hospital: "Ruby Hall Clinic",
    fees: 850,
    languages: ["Hindi", "English", "Marathi"],
    treatmentSlugs: ["piles-fissure"],
  },
  {
    name: "Dr. Suresh Babu",
    slug: "dr-suresh-babu",
    specialty: "Laparoscopy",
    cred: "MBBS, MS (General Surgery), FACS",
    exp: 24,
    rating: "4.8",
    city: "Bangalore",
    hospital: "Narayana Health",
    fees: 1050,
    languages: ["English", "Kannada"],
    treatmentSlugs: ["gallstone"],
  },
  {
    name: "Dr. Nidhi Kapoor",
    slug: "dr-nidhi-kapoor",
    specialty: "Gynaecology",
    cred: "MBBS, DGO, MD (OBG)",
    exp: 10,
    rating: "4.6",
    city: "Mumbai",
    hospital: "Kokilaben Dhirubhai Ambani Hospital",
    fees: 950,
    languages: ["Hindi", "English"],
    treatmentSlugs: [],
  },
];

const initialHospitals = [
  {
    name: "Apollo Hospital",
    slug: "apollo-hospital",
    city: "Delhi NCR",
    rating: "4.9",
    beds: 450,
    specialties: ["Laparoscopy", "Orthopedics", "Cardiology", "Urology"],
    address: "Sarita Vihar, Delhi Mathura Road, New Delhi",
  },
  {
    name: "Fortis Healthcare",
    slug: "fortis-healthcare",
    city: "Mumbai",
    rating: "4.8",
    beds: 350,
    specialties: ["Proctology", "Gynaecology", "ENT", "Oncology"],
    address: "Mulund West, Mumbai",
  },
  {
    name: "Manipal Hospital",
    slug: "manipal-hospital",
    city: "Bangalore",
    rating: "4.8",
    beds: 600,
    specialties: ["Laparoscopy", "Urology", "Neurology", "Orthopedics"],
    address: "HAL Airport Road, Bangalore",
  },
  {
    name: "Max Super Speciality Hospital",
    slug: "max-hospital",
    city: "Delhi NCR",
    rating: "4.7",
    beds: 500,
    specialties: ["Gynaecology", "Ophthalmology", "ENT", "Proctology"],
    address: "Saket, New Delhi",
  },
];

const initialTreatments = [
  {
    name: "Piles / Fissure",
    slug: "piles-fissure",
    category: "Proctology",
    description:
      "Advanced laser treatment for painless piles and fissure surgery with quick 1-day recovery.",
    recoveryTime: "1 - 2 Days",
  },
  {
    name: "Hernia Surgery",
    slug: "hernia",
    category: "Laparoscopy",
    description: "Laparoscopic 3D mesh hernia repair ensuring minimal scars and fast healing.",
    recoveryTime: "2 - 3 Days",
  },
  {
    name: "Kidney Stone Laser Treatment",
    slug: "kidney-stone",
    category: "Urology",
    description: "RIRS & Holmium laser stone removal without surgical incisions.",
    recoveryTime: "1 Day",
  },
  {
    name: "Gallstone Surgery",
    slug: "gallstone",
    category: "Laparoscopy",
    description: "Laparoscopic cholecystectomy for safe gallbladder stone removal.",
    recoveryTime: "2 Days",
  },
];

/**
 * Server function to check and seed default dataset into MongoDB.
 *
 * Order matters: hospitals, treatments and cities are seeded first so doctors can be linked
 * to them via hospitalIds/treatmentIds (best-effort name/slug match against the small sample
 * set above — not every sample doctor has a matching sample hospital/treatment, which is fine
 * for seed/demo data).
 */
export async function runSeed() {
  try {
    await connectToDatabase();

    // Sample data is for an empty development database only. Against the real directory it would
    // mix invented doctors/hospitals/cities in with real records, so refuse.
    if (await Doctor.exists({})) {
      return {
        success: false,
        message: "This database already has real doctor records — sample data was not added.",
      };
    }

    const existingSlugs = new Set((await City.find().select("slug").lean()).map((c) => c.slug));
    const missingCities = initialCities.filter((c) => !existingSlugs.has(c.slug));
    let seededCities = 0;
    if (missingCities.length > 0) {
      await City.insertMany(missingCities);
      seededCities = missingCities.length;
    }

    const hospitalCount = await Hospital.countDocuments();
    let seededHospitals = 0;
    if (hospitalCount === 0) {
      await Hospital.insertMany(initialHospitals);
      seededHospitals = initialHospitals.length;
    }

    const treatmentCount = await Treatment.countDocuments();
    let seededTreatments = 0;
    if (treatmentCount === 0) {
      await Treatment.insertMany(initialTreatments);
      seededTreatments = initialTreatments.length;
    }

    const doctorCount = await Doctor.countDocuments();
    let seededDoctors = 0;
    if (doctorCount === 0) {
      const hospitalsByName = new Map(
        (await Hospital.find({}, { name: 1 }).lean()).map((h) => [h.name, h._id]),
      );
      const treatmentsBySlug = new Map(
        (await Treatment.find({}, { slug: 1 }).lean()).map((t) => [t.slug, t._id]),
      );

      const doctorsToInsert = initialDoctors.map(({ treatmentSlugs, ...doctor }) => ({
        ...doctor,
        hospitalIds: doctor.hospital && hospitalsByName.has(doctor.hospital)
          ? [hospitalsByName.get(doctor.hospital)]
          : [],
        treatmentIds: treatmentSlugs
          .map((slug) => treatmentsBySlug.get(slug))
          .filter((id): id is NonNullable<typeof id> => Boolean(id)),
      }));

      await Doctor.insertMany(doctorsToInsert);
      seededDoctors = initialDoctors.length;
    }

    return {
      success: true,
      message: "Database seed operation completed.",
      counts: {
        doctors: await Doctor.countDocuments(),
        hospitals: await Hospital.countDocuments(),
        treatments: await Treatment.countDocuments(),
        cities: await City.countDocuments(),
      },
      newlySeeded: {
        doctors: seededDoctors,
        hospitals: seededHospitals,
        treatments: seededTreatments,
        cities: seededCities,
      },
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errMessage,
      message: "Failed to seed database.",
    };
  }
}

/** Admin-only manual trigger. Internal callers use runSeed() directly. */
export const seedDatabaseFn = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdminUser();
  return runSeed();
});
