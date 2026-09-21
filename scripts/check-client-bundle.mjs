/**
 * Fails the build if server-only code reached the browser bundle.
 *
 * Why this exists: importing a Mongoose model from a React component — even for one constant or
 * type — pulls the whole MongoDB driver into the client bundle. The bundle then throws on load
 * (`require` and `Buffer` don't exist in a browser), React never hydrates, and every dropdown,
 * filter and menu stops responding while the server-rendered HTML still looks perfectly fine. So
 * the site returns 200 everywhere and appears completely broken to anyone using it.
 *
 * That shipped once. This check turns it into a failed build instead of a dead site.
 *
 * Runs after `vite build`, so it also guards deploys.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Where the client assets land depends on the Nitro preset, and getting this wrong is how a
 * check like this quietly becomes useless: the first version only looked in .output/public/assets,
 * which is the node-server layout. On Vercel — the preset that actually ships — the files go to
 * .vercel/output/static, so it found nothing and passed every time.
 */
const CANDIDATE_DIRS = [
  join(".vercel", "output", "static", "assets"),
  join(".output", "public", "assets"),
  join("dist", "assets"),
];

// Substrings that should never appear in code sent to a browser. Kept deliberately narrow so a
// legitimate string (an error message mentioning "database") can't fail a deploy.
const FORBIDDEN = [
  { pattern: "mongoose#", why: "Mongoose internals — a model or server-only module is imported by client code" },
  { pattern: "MongoClient", why: "the MongoDB driver is in the client bundle" },
  { pattern: "mongodb://", why: "a database connection string is in the client bundle" },
  { pattern: "mongodb+srv://", why: "a database connection string is in the client bundle" },
];

const dirs = CANDIDATE_DIRS.filter((d) => existsSync(d) && statSync(d).isDirectory());

// "I couldn't find anything to check" must never read as "everything is fine" — that is exactly
// how the first version of this script let a broken bundle through.
if (dirs.length === 0) {
  console.error(
    `\n✖ check-client-bundle: no client assets found in any of:\n` +
      CANDIDATE_DIRS.map((d) => `    ${d}`).join("\n") +
      `\n\nEither the build produced nothing, or the output moved. Add the new location to\n` +
      `CANDIDATE_DIRS in scripts/check-client-bundle.mjs — do not leave this check blind.\n`,
  );
  process.exit(1);
}

const failures = [];
let checked = 0;

for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const source = readFileSync(join(dir, file), "utf8");
    checked++;
    for (const { pattern, why } of FORBIDDEN) {
      if (source.includes(pattern)) failures.push({ file: join(dir, file), pattern, why });
    }
  }
}

if (checked === 0) {
  console.error(`\n✖ check-client-bundle: ${dirs.join(", ")} contains no .js files — nothing was verified.\n`);
  process.exit(1);
}

if (failures.length) {
  console.error("\n✖ Server-only code leaked into the client bundle:\n");
  for (const f of failures) console.error(`  ${f.file}: found "${f.pattern}" — ${f.why}`);
  console.error(
    "\nFix: don't import from src/models/** or a module with a top-level `import mongoose`\n" +
      "inside a component. Put shared constants and types in src/lib/admin-constants.ts, and\n" +
      "import Mongoose inside a server-function handler (`await import(\"mongoose\")`) where the\n" +
      "client build strips it.\n",
  );
  process.exit(1);
}

console.log(`check-client-bundle: ${checked} client asset(s) clean in ${dirs.join(", ")}.`);
