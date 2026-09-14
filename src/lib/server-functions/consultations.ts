import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
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
 * Server function to submit a consultation request directly to MongoDB.
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

      const consultation = await Consultation.create({
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
 * Server function to fetch all stored consultations from MongoDB.
 */
export const getConsultationsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();
    const docs = await Consultation.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      count: docs.length,
      consultations: docs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        phone: doc.phone,
        email: doc.email || "",
        treatment: doc.treatment,
        city: doc.city,
        message: doc.message || "",
        status: doc.status,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      count: 0,
      consultations: [],
      error: errMessage,
    };
  }
});
