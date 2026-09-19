import { randomBytes, createHash } from "crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { connectToDatabase } from "@/lib/db";
import { Session } from "@/models/Session";
import { User, type IUser } from "@/models/User";
import { hashPassword, verifyPassword } from "@/lib/password";

export { hashPassword, verifyPassword };

export const SESSION_COOKIE = "pc_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a session for the user and set the HTTP-only session cookie.
 * Must be called from inside a server function handler.
 */
export async function startSession(userId: string): Promise<void> {
  await connectToDatabase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await Session.create({ tokenHash: hashToken(token), userId, expiresAt });

  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    expires: expiresAt,
  });
}

export const createSession = startSession;

export async function endSession(): Promise<void> {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    await connectToDatabase();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

/**
 * Resolve the logged-in user from the session cookie, or null for guests.
 */
export async function getSessionUser(): Promise<IUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;

  await connectToDatabase();
  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  }).lean();
  if (!session) return null;

  return User.findById(session.userId);
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "patient" | "admin";
}

/**
 * An account only counts as an admin once its authenticator (TOTP) setup is confirmed. This
 * deliberately excludes any `role: "admin"` account created by the old password-only backdoors
 * (hardcoded credentials / "admin key" promotion, removed 2026-09-19) — including sessions those
 * accounts already hold — without needing to touch the database.
 */
export function isAdmin<T extends Pick<IUser, "role" | "totpEnabled">>(
  user: T | null | undefined,
): user is T {
  return Boolean(user && user.role === "admin" && user.totpEnabled);
}

export function toPublicUser(user: IUser): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: isAdmin(user) ? "admin" : "patient",
  };
}

/**
 * Ensures the caller is a logged-in admin user, throwing an Error if unauthenticated or not an admin.
 */
export async function requireAdminUser(): Promise<IUser> {
  const user = await getSessionUser();
  if (!isAdmin(user)) {
    throw new Error("Unauthorized: Admin access required.");
  }
  return user;
}

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/** Returns a user-facing error if the account is temporarily locked after repeated failures. */
export function loginLockMessage(user: Pick<IUser, "lockedUntil">): string | null {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or reset your password.`;
  }
  return null;
}

/** Records a failed login; locks the account for 15 minutes after 5 consecutive failures. */
export async function recordFailedLogin(user: IUser): Promise<void> {
  const count = (user.failedLoginCount || 0) + 1;
  user.failedLoginCount = count >= MAX_FAILED_LOGINS ? 0 : count;
  if (count >= MAX_FAILED_LOGINS) user.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
  await user.save();
}

export async function clearFailedLogins(user: IUser): Promise<void> {
  if (user.failedLoginCount || user.lockedUntil) {
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    await user.save();
  }
}
