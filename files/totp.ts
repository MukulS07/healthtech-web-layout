// src/lib/totp.ts
//
// TOTP (Time-based One-Time Password) helpers for admin 2FA.
// This is the standard used by Google Authenticator, Authy, 1Password, etc.
//
// Install first:
//   npm install otplib qrcode
//   npm install -D @types/qrcode

import { authenticator } from "otplib";
import QRCode from "qrcode";

const ISSUER = "YourHealthApp Admin"; // shows up in the authenticator app as the account label

/**
 * Generates a brand-new TOTP secret for an admin during signup.
 * Store `secret` on the user record (encrypted at rest, if you can).
 * Show `otpauthUrl` to the user as a QR code (see generateQrCodeDataUrl below).
 */
export function generateTotpSecret(email: string) {
  const secret = authenticator.generateSecret(); // base32 string, e.g. "JBSWY3DPEHPK3PXP"
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return { secret, otpauthUrl };
}

/**
 * Turns the otpauth:// URL into a scannable QR code, as a data URL
 * you can drop straight into an <img src="..."> tag.
 */
export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

/**
 * Verifies a 6-digit code the admin typed in from their authenticator app.
 * Allows a small clock-drift window by default (otplib handles this).
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  try {
    return authenticator.check(token, secret);
  } catch {
    return false;
  }
}
