import { createServerFn } from "@tanstack/react-start";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generateTotpSecret, generateQrCodeDataUrl, verifyTotpToken } from "@/lib/totp";
import {
  createSession,
  hashPassword,
  loginLockMessage,
  recordFailedLogin,
  recordSuccessfulLogin,
  requireAdminUser,
  suspendedMessage,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";

/**
 * STEP 1 — an EXISTING admin invites a new administrator (name/email/password).
 * Public self-registration is deliberately impossible: the caller must already hold a
 * 2FA-verified admin session. The very first admin is bootstrapped from the command line with
 * `scripts/create-admin.ts`, never through the website.
 * Returns a QR code for the new admin to scan; the account cannot log in until step 2 succeeds.
 */
export const adminSignup = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminUser();
    await connectDB();

    const email = String(data.email || "").trim().toLowerCase();
    if (!data.name?.trim() || !email || !data.password || data.password.length < 12) {
      throw new Error("Name, email and a password of at least 12 characters are required.");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const { secret, otpauthUrl } = generateTotpSecret(email);

    const admin = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: "admin",
      totpSecret: secret,
      totpEnabled: false, // stays false (and so not an admin — see isAdmin) until step 2
    });

    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);

    return {
      userId: admin._id.toString(),
      qrCodeDataUrl, // <img src={qrCodeDataUrl} /> in the UI
      manualSecret: secret, // shown as backup text under the QR code
    };
  });

/**
 * STEP 2 — the new admin scans the QR code in their authenticator app and enters the 6-digit
 * code to confirm setup. Does NOT log anyone in — the new admin signs in normally afterwards
 * (so an inviting admin's own session is never swapped out).
 */
export const confirmAdminTotp = createServerFn({ method: "POST" })
  .validator((data: { userId: string; token: string }) => data)
  .handler(async ({ data }) => {
    await connectDB();

    const admin = await User.findById(data.userId).select("+totpSecret");
    if (!admin || admin.role !== "admin" || admin.totpEnabled || !admin.totpSecret) {
      throw new Error("This admin setup link is invalid or already completed.");
    }

    const isValid = verifyTotpToken(admin.totpSecret, String(data.token || "").trim());
    if (!isValid) {
      throw new Error("Incorrect code. Check your authenticator app and try again.");
    }

    admin.totpEnabled = true;
    await admin.save();

    return { success: true };
  });

/**
 * LOGIN — Password + TOTP code, two factors required for every admin login.
 */
export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; token: string }) => data)
  .handler(async ({ data }) => {
    await connectDB();

    const email = String(data.email || "").trim().toLowerCase();
    const admin = await User.findOne({ email, role: "admin" }).select("+passwordHash +totpSecret");
    if (!admin) {
      throw new Error("Invalid email, password or authenticator code.");
    }

    const locked = loginLockMessage(admin);
    if (locked) throw new Error(locked);

    const suspended = suspendedMessage(admin);
    if (suspended) throw new Error(suspended);

    const passwordOk = await verifyPassword(data.password, admin.passwordHash);
    const tokenOk =
      Boolean(admin.totpEnabled && admin.totpSecret) &&
      /^\d{6}$/.test(String(data.token || "").trim()) &&
      verifyTotpToken(admin.totpSecret as string, String(data.token).trim());

    if (!passwordOk || !tokenOk) {
      await recordFailedLogin(admin);
      throw new Error("Invalid email, password or authenticator code.");
    }

    await recordSuccessfulLogin(admin);
    await createSession(admin._id.toString());

    return { success: true, name: admin.name, user: toPublicUser(admin) };
  });

/**
 * Lists admin accounts and their 2FA status. Admin-only.
 */
export const getAdminAccountsFn = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminUser();
  await connectDB();
  const admins = await User.find({ role: "admin" }).lean();
  return {
    success: true,
    count: admins.length,
    admins: admins.map((a) => ({
      id: String(a._id),
      name: a.name,
      email: a.email,
      role: a.role,
      totpEnabled: Boolean(a.totpEnabled),
      createdAt: new Date(a.createdAt).toISOString(),
    })),
  };
});
