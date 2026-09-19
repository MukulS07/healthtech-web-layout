import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Subscriber } from "@/models/Subscriber";

/** "Join the community" newsletter sign-up. Idempotent — re-subscribing just reactivates. */
export const subscribeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { email: string; source?: string })
  .handler(async ({ data }) => {
    const email = String(data?.email || "").trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) {
      return { success: false as const, error: "Please enter a valid email address." };
    }
    try {
      await connectToDatabase();
      await Subscriber.updateOne(
        { email },
        { $set: { unsubscribedAt: null }, $setOnInsert: { email, source: String(data.source || "homepage").slice(0, 40) } },
        { upsert: true },
      );
      return { success: true as const };
    } catch (error: unknown) {
      console.error("Subscribe failed:", error);
      return { success: false as const, error: "Could not subscribe right now. Please try again." };
    }
  });
