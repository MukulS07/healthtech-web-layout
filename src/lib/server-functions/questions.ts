import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { Question } from "@/models/Question";

export interface SubmitQuestionInput {
  name: string;
  age?: number;
  gender?: string;
  phone: string;
  condition: string;
  message: string;
}

/**
 * Server function to submit a public question. Publicly writable (no login required), matching
 * the reference site's anonymous ask-a-question flow — every submission is real and persisted,
 * not a client-side-only toast like the earlier patient-help/doctor-onboarding forms.
 */
export const submitQuestionFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitQuestionInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      if (!data.name || !data.phone || !data.condition || !data.message) {
        return {
          success: false as const,
          error: "Name, phone, condition, and your question are required.",
        };
      }

      const question = await Question.create({
        name: data.name,
        ...(data.age ? { age: data.age } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        phone: data.phone,
        condition: data.condition,
        message: data.message,
        status: "pending",
      });

      return {
        success: true as const,
        id: String(question._id),
        message: "Your question has been received. A doctor from our team will get back to you.",
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

/**
 * Server function to fetch publicly answered questions (most recent first). Returns an empty
 * list until questions have real answers — no fabricated sample threads.
 */
export const getAnsweredQuestionsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await connectToDatabase();
    const docs = await Question.find({ status: "answered" })
      .sort({ answeredAt: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return {
      success: true as const,
      questions: docs.map((doc) => ({
        id: String(doc._id),
        condition: doc.condition,
        message: doc.message,
        answer: doc.answer || "",
        answeredBy: doc.answeredBy || "Go Surgery care team",
        createdAt: new Date(doc.createdAt).toISOString(),
      })),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, questions: [], error: errMessage };
  }
});
