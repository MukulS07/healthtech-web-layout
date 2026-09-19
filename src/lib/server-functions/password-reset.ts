import { createServerFn } from "@tanstack/react-start";
import { getRequestHost, getRequestProtocol } from "@tanstack/react-start/server";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { User } from "@/models/User";
import { Session } from "@/models/Session";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function siteOrigin(): string {
  const configured = process.env["SITE_URL"];
  if (configured) return configured.replace(/\/$/, "");
  return `${getRequestProtocol({ xForwardedProto: true })}://${getRequestHost({ xForwardedHost: true })}`;
}

/**
 * Step 1 — request a reset link. Always answers with the same generic message whether or not the
 * email is registered, so this can't be used to discover which emails have accounts.
 */
export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string })
  .handler(async ({ data }) => {
    const genericOk = {
      success: true as const,
      message: "If an account exists for that email, a password reset link is on its way.",
    };
    const email = String(data?.email || "").trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) {
      return { success: false as const, error: "Please enter a valid email address." };
    }

    try {
      await connectToDatabase();
      const user = await User.findOne({ email });
      // Admin passwords are reset by another admin / the bootstrap script, not by email.
      if (!user || user.role === "admin") return genericOk;

      const token = randomBytes(32).toString("hex");
      user.passwordResetTokenHash = sha256(token);
      user.passwordResetExpiresAt = new Date(Date.now() + RESET_TTL_MS);
      await user.save();

      const link = `${siteOrigin()}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      await sendEmail({
        to: email,
        subject: "Reset your Go Surgery password",
        text: `Hi ${user.name},\n\nUse this link to set a new password (valid for 1 hour):\n${link}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Hi ${user.name.replace(/[<>&]/g, "")},</p><p>Use the link below to set a new password. It's valid for 1 hour.</p><p><a href="${link}">Reset my password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      });
      return genericOk;
    } catch (error: unknown) {
      console.error("Password reset request failed:", error);
      return { success: false as const, error: "Could not process the request. Please try again." };
    }
  });

const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().regex(/^[a-f0-9]{64}$/, "This reset link is invalid."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter (A-Z).")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character (e.g. !@#$)."),
});

/**
 * Step 2 — set a new password with the emailed token. Signs the account out everywhere.
 */
export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as z.input<typeof resetSchema>)
  .handler(async ({ data }) => {
    const parsed = resetSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
    }

    try {
      await connectToDatabase();
      const user = await User.findOne({ email: parsed.data.email }).select("+passwordResetTokenHash");
      const valid =
        user &&
        user.role !== "admin" &&
        user.passwordResetTokenHash &&
        user.passwordResetTokenHash === sha256(parsed.data.token) &&
        user.passwordResetExpiresAt &&
        user.passwordResetExpiresAt.getTime() > Date.now();
      if (!valid) {
        return {
          success: false as const,
          error: "This reset link is invalid or has expired. Please request a new one.",
        };
      }

      user.passwordHash = await hashPassword(parsed.data.password);
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      user.failedLoginCount = 0;
      user.lockedUntil = null;
      await user.save();
      await Session.deleteMany({ userId: user._id });

      return { success: true as const };
    } catch (error: unknown) {
      console.error("Password reset failed:", error);
      return { success: false as const, error: "Could not reset your password. Please try again." };
    }
  });
