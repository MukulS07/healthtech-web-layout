/**
 * Minimal transactional-email sender (server-only).
 *
 * Uses Resend's HTTP API when RESEND_API_KEY + EMAIL_FROM are set. With no provider configured,
 * the message is logged to the server console instead (fine for local dev; in production it
 * means reset emails silently don't arrive — configure the env vars before relying on it).
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }) {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];

  if (!apiKey || !from) {
    console.warn(
      `[email] No provider configured (RESEND_API_KEY/EMAIL_FROM). Would send to ${opts.to}: ${opts.subject}\n${opts.text}`,
    );
    return { delivered: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text }),
  });
  if (!res.ok) {
    console.error(`[email] Send failed (${res.status}): ${await res.text()}`);
    return { delivered: false as const };
  }
  return { delivered: true as const };
}
