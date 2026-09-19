/** "12,345" → "12,000+" style rounding for headline numbers (always rounds DOWN, never inflates). */
export function roundDownPlus(n: number): string {
  if (n < 100) return String(n);
  const magnitude = n >= 100000 ? 10000 : n >= 10000 ? 1000 : 100;
  return `${(Math.floor(n / magnitude) * magnitude).toLocaleString("en-IN")}+`;
}
