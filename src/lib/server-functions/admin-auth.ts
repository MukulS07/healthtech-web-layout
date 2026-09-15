import { createServerFn } from "@tanstack/react-start";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { generateTotpSecret, generateQrCodeDataUrl, verifyTotpToken } from "@/lib/totp";
import { hashPassword, verifyPassword, createSession, toPublicUser } from "@/lib/auth";

/**
 * STEP 1 — Admin fills in name/email/password.
 * Creates the admin account (unverified 2FA), returns a QR code to scan.
 * The account cannot log in yet until the TOTP code is confirmed (step 2).
 */
export const adminSignup = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => {
    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(data.password);
    const { secret, otpauthUrl } = generateTotpSecret(data.email);

    const admin = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: "admin",
      totpSecret: secret,
      totpEnabled: false, // stays false until confirmAdminTotp succeeds
    });

    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);

    return {
      userId: admin._id.toString(),
      qrCodeDataUrl, // <img src={qrCodeDataUrl} /> in the UI
      manualSecret: secret, // shown as backup text under the QR code
    };
  });

/**
 * STEP 2 — Admin scans the QR code in their authenticator app, then types
 * the 6-digit code it shows to confirm setup worked before we enable 2FA.
 */
export const confirmAdminTotp = createServerFn({ method: "POST" })
  .validator((data: { userId: string; token: string }) => data)
  .handler(async ({ data }) => {
    await connectDB();

    const admin = await User.findById(data.userId).select("+totpSecret");
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin account not found.");
    }

    if (!admin.totpSecret) {
      throw new Error("TOTP secret is missing for this account.");
    }

    const isValid = verifyTotpToken(admin.totpSecret, data.token);
    if (!isValid) {
      throw new Error("Incorrect code. Check your authenticator app and try again.");
    }

    admin.totpEnabled = true;
    await admin.save();

    await createSession(admin._id.toString());

    return { success: true, user: toPublicUser(admin) };
  });

/**
 * LOGIN — Password + TOTP code, two factors required for every admin login.
 */
export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string; token: string }) => data)
  .handler(async ({ data }) => {
    await connectDB();

    const admin = await User.findOne({ email: data.email, role: "admin" }).select(
      "+passwordHash +totpSecret"
    );
    if (!admin) {
      throw new Error("Invalid email or password.");
    }

    const passwordOk = await verifyPassword(data.password, admin.passwordHash);
    if (!passwordOk) {
      throw new Error("Invalid email or password.");
    }

    if (!admin.totpEnabled) {
      throw new Error("Two-factor setup is incomplete for this account. Please complete 2FA setup at /admin/signup.");
    }

    if (!admin.totpSecret) {
      throw new Error("TOTP secret is missing for this account.");
    }

    if (!data.token || data.token.trim().length !== 6) {
      throw new Error("Please enter the 6-digit authenticator code from your 2FA app.");
    }

    const tokenOk = verifyTotpToken(admin.totpSecret, data.token.trim());
    if (!tokenOk) {
      throw new Error("Incorrect authenticator code. Check your TOTP app and try again.");
    }

    await createSession(admin._id.toString());

    return { success: true, name: admin.name, user: toPublicUser(admin) };
  });

/**
 * Helper to fetch all saved admin accounts and their 2FA status from the database.
 */
export const getAdminAccountsFn = createServerFn({ method: "GET" }).handler(async () => {
  await connectDB();
  const admins = await User.find({ role: "admin" }).select("+passwordHash +totpSecret").lean();
  return {
    success: true,
    count: admins.length,
    admins: admins.map((a) => ({
      id: String(a._id),
      name: a.name,
      email: a.email,
      role: a.role,
      totpEnabled: Boolean(a.totpEnabled),
      hasTotpSecret: Boolean(a.totpSecret),
      createdAt: new Date(a.createdAt).toISOString(),
    })),
  };
});
