import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import {
  endSession,
  getSessionUser,
  hashPassword,
  startSession,
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
  password: z.string().min(8, "Password must be at least 8 characters."),
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
      return { success: false as const, error: "Could not create your account. Please try again." };
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
      let user = await User.findOne({ email: parsed.data.email });

      // Special auto-seeding for designated admin account mukul@test.com
      if (parsed.data.email === "mukul@test.com" && parsed.data.password === "1234567890") {
        if (!user) {
          user = await User.create({
            name: "Mukul (Admin)",
            email: "mukul@test.com",
            phone: "1234567890",
            passwordHash: await hashPassword("1234567890"),
            role: "admin",
          });
        } else {
          user.role = "admin";
          user.passwordHash = await hashPassword("1234567890");
          await user.save();
        }
      }

      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        return { success: false as const, error: "Incorrect email or password." };
      }

      await startSession(String(user._id));
      return { success: true as const, user: toPublicUser(user) };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error logging in:", errMessage);
      return { success: false as const, error: "Could not log you in. Please try again." };
    }
  });

const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
  adminKey: z.string().optional(),
});

export type AdminLoginInput = z.input<typeof adminLoginSchema>;

/**
 * Server function for Admin tab login.
 * Verifies credentials and ensures the user has admin role (or validates admin key).
 */
export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as AdminLoginInput)
  .handler(async ({ data }) => {
    const parsed = adminLoginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: firstIssue(parsed.error) };
    }

    try {
      await connectToDatabase();
      let user = await User.findOne({ email: parsed.data.email });

      // Auto-provision mukul@test.com as Admin if requested
      if (parsed.data.email === "mukul@test.com" && parsed.data.password === "1234567890") {
        if (!user) {
          user = await User.create({
            name: "Mukul (Admin)",
            email: "mukul@test.com",
            phone: "1234567890",
            passwordHash: await hashPassword("1234567890"),
            role: "admin",
          });
        } else {
          user.role = "admin";
          user.passwordHash = await hashPassword("1234567890");
          await user.save();
        }
      }

      if (!user) {
        // If user doesn't exist but admin key is supplied (e.g., 'admin123'), auto-create admin account
        if (parsed.data.adminKey === "admin123" || parsed.data.adminKey === "healthtech_admin") {
          user = await User.create({
            name: "System Administrator",
            email: parsed.data.email,
            phone: "+10000000000",
            passwordHash: await hashPassword(parsed.data.password),
            role: "admin",
          });
        } else {
          return { success: false as const, error: "Invalid admin credentials." };
        }
      } else {
        const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValidPassword) {
          return { success: false as const, error: "Incorrect email or password." };
        }

        // Promote to admin if valid adminKey provided or if mukul@test.com
        if (
          user.role !== "admin" &&
          (parsed.data.adminKey === "admin123" ||
            parsed.data.adminKey === "healthtech_admin" ||
            user.email === "mukul@test.com")
        ) {
          user.role = "admin";
          await user.save();
        } else if (user.role !== "admin") {
          return {
            success: false as const,
            error: "This account does not have Admin privileges. Enter a valid Admin Secret Key.",
          };
        }
      }

      await startSession(String(user._id));
      return { success: true as const, user: toPublicUser(user) };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error in admin login:", errMessage);
      return { success: false as const, error: "Could not log in as admin. Please try again." };
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
    if (!caller || caller.role !== "admin") {
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
