/**
 * Hold back imported reviews that fail basic authenticity checks — WITHOUT deleting anything.
 *
 *   MONGODB_URI="mongodb://127.0.0.1:27017/prod-sixdoctar" npx tsx scripts/flag-reviews.ts [--dry-run]
 *   MONGODB_URI=... npx tsx scripts/flag-reviews.ts --undo      # put every flagged review back
 *
 * A flagged review gets `status: "pending"` (so every public list and count skips it, exactly
 * like an unmoderated website submission), plus `flagReason` and `flaggedAt`. Only reviews with
 * no status yet are touched, so moderated website reviews are never overridden. Safe to re-run.
 *
 * Checks (evidence that a review was generated from a template rather than written by a patient):
 *  - blank-doctor-name:    the text has an empty slot where a name should be ("Dr.  and I…", "Dr. 's")
 *  - duplicate-text:       the exact same comment (40+ characters) appears on more than one review
 *  - non-standard-rating:  rating isn't a whole 1–5 value (e.g. 4.1, 4.2 — not possible from star input)
 *  - gibberish:            keyboard mash that clears the length bar but says nothing
 *                          ("dxgfhghjil aaaaaaaaaaaa", "bhui bhjk fgh fgh dgf fyu gghq gfsqgd")
 */
import mongoose from "mongoose";
import { Review, type ReviewFlag } from "../src/models/Review";

// "Dr.  and…" / "Dr. 's clinic" / "Dr.'s" — but not "Dr. K." (one space then a name).
const BLANK_NAME = /Dr\.( 's\b|\s\s|'s\b)/;

async function main() {
  const uri = process.env["MONGODB_URI"];
  const undo = process.argv.includes("--undo");
  const dryRun = process.argv.includes("--dry-run");
  if (!uri) {
    console.error("Usage: MONGODB_URI=... npx tsx scripts/flag-reviews.ts [--dry-run | --undo]");
    process.exit(1);
  }
  await mongoose.connect(uri);

  if (undo) {
    const res = dryRun
      ? { modifiedCount: await Review.countDocuments({ flagReason: { $exists: true } }) }
      : await Review.updateMany(
          { flagReason: { $exists: true } },
          { $unset: { status: "", flagReason: "", flaggedAt: "" } },
        );
    console.log(`${dryRun ? "[dry run] would restore" : "Restored"} ${res.modifiedCount} flagged reviews.`);
    await mongoose.disconnect();
    return;
  }

  const unmoderated = { status: { $exists: false } };
  const reasons = new Map<string, Set<ReviewFlag>>();
  const add = (id: unknown, reason: ReviewFlag) => {
    const key = String(id);
    if (!reasons.has(key)) reasons.set(key, new Set());
    reasons.get(key)!.add(reason);
  };

  for (const doc of await Review.find({ ...unmoderated, comment: BLANK_NAME }).select("_id").lean()) {
    add(doc._id, "blank-doctor-name");
  }
  for (const doc of await Review.find({ ...unmoderated, rating: { $nin: [1, 2, 3, 4, 5] } }).select("_id").lean()) {
    add(doc._id, "non-standard-rating");
  }
  // Real prose is full of words that contain a vowel; mashed consonants aren't. Count letter-runs
  // of 3+ characters containing a vowel and flag anything with almost none. Mirrors the read-time
  // guard in getReviewsFn, so running this just makes the same decision durable and visible in admin.
  const gibberish = await Review.aggregate<{ _id: unknown }>(
    [
      { $match: { ...unmoderated, $expr: { $gte: [{ $strLenCP: { $ifNull: ["$comment", ""] } }, 20] } } },
      {
        $match: {
          $expr: {
            $lt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $regexFindAll: {
                        input: { $toLower: { $ifNull: ["$comment", ""] } },
                        regex: "[a-z]*[aeiou][a-z]*",
                      },
                    },
                    as: "w",
                    cond: { $gte: [{ $strLenCP: "$$w.match" }, 3] },
                  },
                },
              },
              5,
            ],
          },
        },
      },
      { $project: { _id: 1 } },
    ],
    { allowDiskUse: true },
  );
  for (const doc of gibberish) add(doc._id, "gibberish");

  const dupes = await Review.aggregate<{ ids: unknown[] }>(
    [
      // Only long texts: identical short reviews ("Good doctor") are normal; identical paragraphs aren't.
      { $match: { ...unmoderated, $expr: { $gte: [{ $strLenCP: { $ifNull: ["$comment", ""] } }, 40] } } },
      { $group: { _id: "$comment", ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
      { $project: { ids: 1 } },
    ],
    { allowDiskUse: true },
  );
  for (const group of dupes) for (const id of group.ids) add(id, "duplicate-text");

  const tally: Record<string, number> = {};
  for (const set of reasons.values()) for (const r of set) tally[r] = (tally[r] || 0) + 1;
  console.log(`Reviews to hold back: ${reasons.size}`, tally);

  if (dryRun) {
    console.log("[dry run] nothing written.");
    await mongoose.disconnect();
    return;
  }

  const now = new Date();
  const ops = [...reasons].map(([id, set]) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id), ...unmoderated },
      update: { $set: { status: "pending" as const, flagReason: [...set], flaggedAt: now } },
    },
  }));
  let modified = 0;
  for (let i = 0; i < ops.length; i += 2000) {
    const res = await Review.bulkWrite(ops.slice(i, i + 2000), { ordered: false });
    modified += res.modifiedCount;
  }
  console.log(`Held back ${modified} reviews (status "pending"). Nothing was deleted.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
