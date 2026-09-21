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
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ASSET_DIR = join(".output", "public", "assets");

// Substrings that should never appear in code sent to a browser. Kept deliberately narrow so a
// legitimate string (an error message mentioning "database") can't fail a deploy.
const FORBIDDEN = [
  { pattern: "mongoose#", why: "Mongoose internals — a model or server-only module is imported by client code" },
  { pattern: "MongoClient", why: "the MongoDB driver is in the client bundle" },
  { pattern: "mongodb://", why: "a database connection string is in the client bundle" },
];

if (!existsSync(ASSET_DIR)) {
  console.log(`check-client-bundle: no ${ASSET_DIR}, nothing to check.`);
  process.exit(0);
}

const files = readdirSync(ASSET_DIR).filter((f) => f.endsWith(".js"));
const failures = [];

for (const file of files) {
  const source = readFileSync(join(ASSET_DIR, file), "utf8");
  for (const { pattern, why } of FORBIDDEN) {
    if (source.includes(pattern)) failures.push({ file, pattern, why });
  }
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

console.log(`check-client-bundle: ${files.length} client asset(s) clean.`);
