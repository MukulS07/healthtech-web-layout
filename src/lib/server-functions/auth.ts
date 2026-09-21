import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import {
  endSession,
  getSessionUser,
  hashPassword,
  isAdmin,
  loginLockMessage,
  recordFailedLogin,
  recordSuccessfulLogin,
  startSession,
  suspendedMessage,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import { User } from "@/models/User";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter (A-Z).")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character (e.g. !@#$)."),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export type SignupInput = z.input<typeof signupSchema>;
export type LoginInput = z.input<typeof loginSchema>;

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

/**
 * Server function to register a new patient account and log them in.
 */
export const signupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SignupInput)
  .handler(async ({ data }) => {
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: firstIssue(parsed.error) };
    }

    try {
      await connectToDatabase();

      const existing = await User.exists({ email: parsed.data.email });
      if (existing) {
        return {
          success: false as const,
          error: "An account with this email already exists. Please log in.",
        };
      }

      const user = await User.create({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        passwordHash: await hashPassword(parsed.data.password),
      });

      await startSession(String(user._id));
      return { success: true as const, user: toPublicUser(user) };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error creating account:", errMessage);
      return { success: false as const, error: errMessage || "Could not create your account. Please try again." };
    }
  });

/**
 * Server function to log in with email + password.
 */
export const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as LoginInput)
  .handler(async ({ data }) => {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: firstIssue(parsed.error) };
    }

    try {
      await connectToDatabase();
      const user = await User.findOne({ email: parsed.data.email });

      const locked = user ? loginLockMessage(user) : null;
      if (locked) return { success: false as const, error: locked };

      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        if (user) await recordFailedLogin(user);
        return { success: false as const, error: "Incorrect email or password." };
      }

      // Admin accounts must use the 2FA admin login — the patient form must never become a
      // password-only way into an admin session.
      if (user.role === "admin") {
        return {
          success: false as const,
          error: "This is an administrator account. Please sign in through the admin portal.",
        };
      }

      const suspended = suspendedMessage(user);
      if (suspended) return { success: false as const, error: suspended };

      await recordSuccessfulLogin(user);
      await startSession(String(user._id));
      return { success: true as const, user: toPublicUser(user) };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error logging in:", errMessage);
      return { success: false as const, error: errMessage || "Could not log you in. Please try again." };
    }
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  await endSession();
  return { success: true as const };
});

/**
 * Server function returning the logged-in user, or null for guests.
 */
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getSessionUser();
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
});

/**
 * Server function for admin to fetch all registered users from MongoDB users collection.
 */
export const getRegisteredUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const caller = await getSessionUser();
    if (!isAdmin(caller)) {
      return { success: false as const, error: "Unauthorized: Admin access required." };
    }

    await connectToDatabase();
    const docs = await User.find().sort({ createdAt: -1 }).lean();

    return {
      success: true as const,
      users: docs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        role: doc.role || "patient",
        createdAt: new Date(doc.createdAt).toISOString(),
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: errMessage };
  }
});
