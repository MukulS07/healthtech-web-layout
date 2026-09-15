import mongoose from "mongoose";

const uri = "mongodb+srv://mukulsharmaworks_db_user:9ebkMpqEgAX74DIi@healthwebdev.j1mdro6.mongodb.net/?appName=HEALTHwebdev";

const DoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    specialty: { type: String, required: true },
    cred: { type: String, required: true },
    exp: { type: Number, required: true },
    rating: { type: String, default: "4.8" },
    city: { type: String, required: true },
    hospital: { type: String, required: true },
    fees: { type: Number, required: true },
  },
  { timestamps: true }
);

const HospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    city: { type: String, required: true },
    rating: { type: String, default: "4.8" },
    beds: { type: Number, default: 100 },
    specialties: [{ type: String }],
    address: { type: String, required: true },
  },
  { timestamps: true }
);

const TreatmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    recoveryTime: { type: String, required: true },
  },
  { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
const Hospital = mongoose.models.Hospital || mongoose.model("Hospital", HospitalSchema);
const Treatment = mongoose.models.Treatment || mongoose.model("Treatment", TreatmentSchema);

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

async function main() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const dCount = await Doctor.countDocuments();
    if (dCount === 0) {
      await Doctor.insertMany(initialDoctors);
      console.log(`✅ Seeded ${initialDoctors.length} doctors.`);
    } else {
      console.log(`ℹ️ Doctors collection already has ${dCount} items.`);
    }

    const hCount = await Hospital.countDocuments();
    if (hCount === 0) {
      await Hospital.insertMany(initialHospitals);
      console.log(`✅ Seeded ${initialHospitals.length} hospitals.`);
    } else {
      console.log(`ℹ️ Hospitals collection already has ${hCount} items.`);
    }

    const tCount = await Treatment.countDocuments();
    if (tCount === 0) {
      await Treatment.insertMany(initialTreatments);
      console.log(`✅ Seeded ${initialTreatments.length} treatments.`);
    } else {
      console.log(`ℹ️ Treatments collection already has ${tCount} items.`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

main();
