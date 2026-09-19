/**
 * Bootstrap an administrator account from the command line (the website only lets an EXISTING
 * admin invite new ones, so the first admin has to come from here).
 *
 *   MONGODB_URI="mongodb+srv://..." npx tsx scripts/create-admin.ts "Full Name" admin@example.com
 *
 * Prompts for nothing: generates a strong random password (or uses ADMIN_PASSWORD from the
 * environment, min. 12 characters — env rather than an argument so it stays out of shell history)
 * and a TOTP secret, prints both once,
 * plus an otpauth:// URL to paste into an authenticator app (or turn into a QR code). Also works
 * to re-secure an EXISTING account with that email (e.g. a legacy admin with no 2FA): it resets
 * its password + TOTP and signs it out everywhere.
 */
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { hashPassword } from "../src/lib/password";
import { generateTotpSecret } from "../src/lib/totp";
import { User } from "../src/models/User";
import { Session } from "../src/models/Session";

async function main() {
  const [name, rawEmail] = process.argv.slice(2);
  const uri = process.env["MONGODB_URI"];
  if (!name || !rawEmail || !uri) {
    console.error('Usage: MONGODB_URI=... npx tsx scripts/create-admin.ts "Full Name" email@example.com');
    process.exit(1);
  }
  const email = rawEmail.trim().toLowerCase();
  await mongoose.connect(uri);

  const chosen = process.env["ADMIN_PASSWORD"];
  if (chosen !== undefined && chosen.length < 12) {
    console.error("ADMIN_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }
  const password = chosen || randomBytes(12).toString("base64url");
  const { secret, otpauthUrl } = generateTotpSecret(email);
  const passwordHash = await hashPassword(password);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = name;
    existing.role = "admin";
    existing.passwordHash = passwordHash;
    existing.totpSecret = secret;
    existing.totpEnabled = true;
    existing.failedLoginCount = 0;
    existing.lockedUntil = null;
    await existing.save();
    await Session.deleteMany({ userId: existing._id });
  } else {
    await User.create({ name, email, passwordHash, role: "admin", totpSecret: secret, totpEnabled: true });
  }

  console.log(`\nAdmin ready: ${email}`);
  console.log(chosen ? "Password: the one you set in ADMIN_PASSWORD" : `Password (shown once — store it in a password manager): ${password}`);
  console.log(`Authenticator setup URL: ${otpauthUrl}`);
  console.log(`Manual TOTP key: ${secret}\n`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
