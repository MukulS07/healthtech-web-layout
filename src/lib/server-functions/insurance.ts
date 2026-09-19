import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { InsuranceCheck } from "@/models/InsuranceCheck";
import { CALLBACK_PHRASE } from "@/lib/site";

export interface SubmitInsuranceCheckInput {
  name: string;
  phone: string;
  city: string;
  condition: string;
  insurer: string;
  policyNumber?: string;
}

/**
 * Server function to submit a cashless-insurance eligibility check request. Publicly writable
 * (no login required) — real DB write, same pattern as submitQuestionFn. The actual eligibility
 * check happens off-platform (our insurance desk calls the patient); there's no live insurer API
 * integration, so this only records the request for the desk to act on.
 */
export const submitInsuranceCheckFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitInsuranceCheckInput)
  .handler(async ({ data }) => {
    try {
      await connectToDatabase();

      if (!data.name || !data.phone || !data.city || !data.condition || !data.insurer) {
        return {
          success: false as const,
          error: "Name, phone, city, condition, and insurer are all required.",
        };
      }

      const check = await InsuranceCheck.create({
        name: data.name,
        phone: data.phone,
        city: data.city,
        condition: data.condition,
        insurer: data.insurer,
        ...(data.policyNumber ? { policyNumber: data.policyNumber } : {}),
        status: "pending",
      });

      return {
        success: true as const,
        id: String(check._id),
        message: `Request received. Our team will call you ${CALLBACK_PHRASE} about your eligibility.`,
      };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
