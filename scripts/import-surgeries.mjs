// One-off idempotent importer: seeds the full surgical catalog (from
// "Complete List of Surgical Categories and Procedures.docx") into the Treatment collection.
// Safe to re-run — upserts by slug, never overwrites fields an admin may have since hand-edited
// beyond name/category (description/recoveryTime/benefits are only set on first insert).
//
// Usage: MONGODB_URI="mongodb+srv://..." node scripts/import-surgeries.mjs
// (or run `vercel env pull .env.local --environment=production` first, this script will read
// MONGODB_URI out of .env.local automatically if it's not already set in the environment)

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDotEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const contents = readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Run `vercel env pull .env.local --environment=production` first, " +
      "or pass it inline: MONGODB_URI=... node scripts/import-surgeries.mjs",
  );
  process.exit(1);
}

const catalogPath = path.join(__dirname, "surgery-catalog-data.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf-8"));

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function categoryShortSlug(category) {
  return slugify(category).split("-").slice(0, 2).join("-");
}

const TreatmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    recoveryTime: { type: String },
    benefits: [{ type: String }],
    faqs: [{ question: String, answer: String }],
  },
  { timestamps: true },
);

const Treatment = mongoose.models.Treatment || mongoose.model("Treatment", TreatmentSchema);

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB.");

  const usedSlugs = new Set(
    (await Treatment.find({}, { slug: 1 }).lean()).map((doc) => doc.slug),
  );

  let inserted = 0;
  let skipped = 0;

  for (const { category, procedures } of catalog) {
    for (const name of procedures) {
      let slug = slugify(name);

      // Disambiguate the handful of procedure names that repeat across categories
      // (e.g. "Sleeve gastrectomy" under both General Surgery and Bariatric Surgery).
      if (usedSlugs.has(slug)) {
        const candidate = `${slug}-${categoryShortSlug(category)}`;
        slug = usedSlugs.has(candidate) ? `${candidate}-${usedSlugs.size}` : candidate;
      }

      const existing = await Treatment.findOne({ name, category });
      if (existing) {
        skipped += 1;
        continue;
      }

      await Treatment.create({
        name,
        slug,
        category,
        description: `${name} performed by our specialist surgical team as part of ${category}.`,
        recoveryTime: "Discussed during consultation",
        benefits: ["Specialist-led care", "Discussed during consultation"],
      });
      usedSlugs.add(slug);
      inserted += 1;
    }
  }

  console.log(`Done. Inserted ${inserted} new procedures, skipped ${skipped} already present.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
