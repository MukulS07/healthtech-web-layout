import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Consultation } from "@/models/Consultation";

export interface SubmitConsultationInput {
  name: string;
  phone: string;
  email?: string;
  treatment: string;
  city: string;
  message?: string;
}

/**
 * Server function to submit a consultation request.
 */
export const submitConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitConsultationInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      if (!data.name || !data.phone || !data.treatment || !data.city) {
        return {
          success: false,
          error: "Name, phone, treatment, and city are required fields.",
        };
      }

      // Link the booking to the account when the patient is logged in.
      const user = await getSessionUser();

      const consultation = await Consultation.create({
        ...(user ? { userId: user._id } : {}),
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        treatment: data.treatment,
        city: data.city,
        message: data.message || "",
        status: "pending",
      });

      return {
        success: true,
        id: String(consultation._id),
        message: "Consultation request saved to database successfully!",
        linkedToAccount: Boolean(user),
        consultation: {
          id: String(consultation._id),
          name: consultation.name,
          phone: consultation.phone,
          treatment: consultation.treatment,
          city: consultation.city,
          createdAt: consultation.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error saving consultation to MongoDB:", errMessage);
      return {
        success: false,
        error: errMessage,
        message: "Failed to save consultation request to database.",
      };
    }
  });

/**
 * Server function to fetch the logged-in patient's own consultations and their status.
 */
export const getMyConsultationsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false as const, authenticated: false, consultations: [] };
    }

    const docs = await Consultation.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    return {
      success: true as const,
      authenticated: true,
      consultations: docs.map((doc) => ({
        id: String(doc._id),
        treatment: doc.treatment,
        city: doc.city,
        message: doc.message || "",
        status: doc.status,
        createdAt: new Date(doc.createdAt).toISOString(),
        updatedAt: new Date(doc.updatedAt).toISOString(),
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false as const,
      authenticated: true,
      consultations: [],
      error: errMessage,
    };
  }
});
