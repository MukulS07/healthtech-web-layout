// src/lib/totp.ts
//
// TOTP (Time-based One-Time Password) helpers for admin 2FA.
// This is the standard used by Google Authenticator, Authy, 1Password, etc.

import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

const ISSUER = "PrimeCare Admin";

export const authenticator = {
  generateSecret: () => generateSecret(),
  keyuri: (email: string, issuer: string, secret: string) =>
    generateURI({ secret, issuer, label: email }),
  check: (token: string, secret: string) => {
    const res = verifySync({ secret, token });
    return res.valid;
  },
};

/**
 * Generates a brand-new TOTP secret for an admin during signup.
 * Store `secret` on the user record (encrypted at rest, if you can).
 * Show `otpauthUrl` to the user as a QR code (see generateQrCodeDataUrl below).
 */
export function generateTotpSecret(email: string) {
  const secret = authenticator.generateSecret();
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
