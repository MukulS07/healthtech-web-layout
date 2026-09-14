import { randomBytes, scrypt, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { connectToDatabase } from "@/lib/db";
import { Session } from "@/models/Session";
import { User, type IUser } from "@/models/User";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const SESSION_COOKIE = "pc_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const KEY_LENGTH = 64;

/**
 * Hash a password with scrypt and a random salt. Stored as "salt:hash" (hex).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

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
}

export function toPublicUser(user: IUser): PublicUser {
  return { id: String(user._id), name: user.name, email: user.email, phone: user.phone };
}
