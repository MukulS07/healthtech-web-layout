// src/lib/server-functions/admin-auth.ts
//
// Drop this alongside your existing src/lib/server-functions/auth.ts.
// It assumes your current auth.ts already exports password hashing +
// session helpers — adjust the import names below to match yours.

import { createServerFn } from "@tanstack/react-start";
import { connectDB } from "~/lib/db";
import { User } from "~/models/User";
import { generateTotpSecret, generateQrCodeDataUrl, verifyTotpToken } from "~/lib/totp";

// --- Adjust these two imports to match your real auth.ts exports ---
import { hashPassword, verifyPassword, createSession } from "~/lib/auth";
// ---------------------------------------------------------------------

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
      password: passwordHash,
      role: "admin",
      totpSecret: secret,
      totpEnabled: false, // stays false until confirmAdminTotp succeeds
    });

    const qrCodeDataUrl = await generateQrCodeDataUrl(otpauthUrl);

    return {
      userId: admin._id.toString(),
      qrCodeDataUrl,     // <img src={qrCodeDataUrl} /> in the UI
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

    const isValid = verifyTotpToken(admin.totpSecret, data.token);
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

    const admin = await User.findOne({ email: data.email, role: "admin" }).select(
      "+password +totpSecret"
    );
    if (!admin) {
      throw new Error("Invalid email or password.");
    }

    const passwordOk = await verifyPassword(data.password, admin.password);
    if (!passwordOk) {
      throw new Error("Invalid email or password.");
    }

    if (!admin.totpEnabled) {
      throw new Error("Two-factor setup is incomplete for this account.");
    }

    const tokenOk = verifyTotpToken(admin.totpSecret, data.token);
    if (!tokenOk) {
      throw new Error("Incorrect authenticator code.");
    }

    // Reuse your existing session/cookie logic exactly as your patient
    // login does today, so admin sessions behave consistently.
    await createSession(admin._id.toString());

    return { success: true, name: admin.name };
  });
