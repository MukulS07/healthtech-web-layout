/**
 * Display normalisation for the scraped doctor data (imported prod archive), applied at read
 * time so the source documents are never rewritten. Observed problems this handles:
 * "MBBS | | ^ MD | |" qualifications, ALL-CAPS or "Dr.pratik" names, "Doctor" used as a
 * surname, and non-numeric experience values like "2w".
 */

const SMALL_WORDS = new Set(["and", "of", "the", "in"]);

function titleCaseWord(w: string, i: number) {
  if (!w) return w;
  if (i > 0 && SMALL_WORDS.has(w.toLowerCase())) return w.toLowerCase();
  // Keep initials like "K.M." / "RP" readable: short all-caps tokens stay upper-case.
  if (/^[A-Z]{1,2}\.?$/.test(w)) return w.toUpperCase();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

/** "MAHESH GUPTA" → "Dr. Mahesh Gupta"; "Dr.pratik Chirde" → "Dr. Pratik Chirde"; drops "Doctor" surname. */
export function formatDoctorName(firstName?: string, lastName?: string): string {
  let raw = [firstName, lastName].filter(Boolean).join(" ");
  raw = raw.replace(/\s+/g, " ").trim();
  raw = raw.replace(/^(dr\.?\s*)+/i, "").trim();
  raw = raw.replace(/\s+doctor$/i, "").trim();
  if (!raw) return "Doctor";
  const words = raw.split(" ").map(titleCaseWord);
  return `Dr. ${words.join(" ")}`;
}

/** Initials for the avatar fallback, from the display name (ignores the "Dr." prefix). */
export function initialsFor(displayName: string): string {
  const parts = displayName.replace(/^Dr\.\s*/, "").split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1]![0] : "");
  return letters.toUpperCase() || "DR";
}

/** "MBBS | | ^ MD | |" → "MBBS, MD" (split on ^ | , ; / newlines, dedupe, drop empties). */
export function formatQualification(q?: string): string {
  if (!q) return "";
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const piece of q.split(/[\^|,;\n]+/)) {
    const clean = piece.replace(/\s+/g, " ").trim().replace(/^[-–.\s]+|[-–.\s]+$/g, "");
    if (!clean || clean.length > 60) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(clean);
  }
  return parts.join(", ");
}

/** Integer years of experience, or null for missing/garbage values ("2w", 0, >60). */
export function formatExperience(exp: unknown): number | null {
  const n = typeof exp === "number" ? exp : typeof exp === "string" && /^\s*\d{1,2}\s*$/.test(exp) ? Number(exp) : NaN;
  if (!Number.isFinite(n) || n < 1 || n > 60) return null;
  return Math.round(n);
}

/** Title-case a free-text specialization for display ("ent-specialist" → "Ent Specialist" → "ENT Specialist"). */
export function formatSpecialization(s?: string): string {
  if (!s) return "";
  const cleaned = s
    .replace(/[-_]+/g, " ")
    .replace(/\s+in\s+[a-z .]+$/i, "") // "Laparoscopic Surgeon In Bhatpara" → "Laparoscopic Surgeon"
    .replace(/\s+/g, " ")
    .trim();
  return cleaned
    .split(" ")
    .map((w, i) => (/^(ent|ivf|obs|gyn)$/i.test(w) ? w.toUpperCase() : titleCaseWord(w, i)))
    .join(" ");
}

/** A rating worth showing: null unless there is a real non-zero average with at least one review. */
export function displayRating(average: unknown, count: unknown): { value: string; count: number } | null {
  const avg = typeof average === "number" ? average : Number(average);
  const n = typeof count === "number" ? count : Number(count);
  if (!Number.isFinite(avg) || avg <= 0 || !Number.isFinite(n) || n <= 0) return null;
  return { value: avg.toFixed(1), count: n };
}

/** Escape user input before building a RegExp (prevents ReDoS / invalid-regex errors). */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
