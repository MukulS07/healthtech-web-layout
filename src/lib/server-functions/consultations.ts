import { createServerFn } from "@tanstack/react-start";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { Consultation, type IConsultation } from "@/models/Consultation";
import { Treatment } from "@/models/Treatment";
import { Doctor } from "@/models/Doctor";

/**
 * Enforces the claim lock: once a booking is claimed, only that admin may act on it
 * (assign/status/delete) until it's released back to the shared queue.
 */
function assertClaimOwnership(
  consultation: Pick<IConsultation, "claimedByAdminId">,
  adminUserId: unknown,
): { success: false; error: string } | null {
  if (
    consultation.claimedByAdminId &&
    String(consultation.claimedByAdminId) !== String(adminUserId)
  ) {
    return {
      success: false,
      error: "This booking is claimed by another admin. Release it first to act on it.",
    };
  }
  return null;
}

export interface SubmitConsultationInput {
  name: string;
  phone: string;
  email?: string;
  treatmentId: string;
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

      if (!data.name || !data.phone || !data.treatmentId || !data.city) {
        return {
          success: false,
          error: "Name, phone, surgery, and city are required fields.",
        };
      }

      // Look the treatment up server-side so the name/category snapshot can't be spoofed.
      const treatment = await Treatment.findById(data.treatmentId);
      if (!treatment) {
        return { success: false, error: "Selected surgery could not be found. Please pick again." };
      }

      // Link the booking to the account when the patient is logged in.
      const user = await getSessionUser();

      const consultation = await Consultation.create({
        ...(user ? { userId: user._id } : {}),
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        treatmentId: treatment._id,
        treatment: treatment.name,
        category: treatment.category,
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

    const docs = await Consultation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("assignedDoctorId", "name specialty")
      .lean();

    return {
      success: true as const,
      authenticated: true,
      consultations: docs.map((doc) => {
        const assignedDoctor = doc.assignedDoctorId as unknown as
          | { name: string; specialty: string }
          | undefined;
        return {
          id: String(doc._id),
          treatment: doc.treatment,
          category: doc.category,
          city: doc.city,
          message: doc.message || "",
          status: doc.status,
          assignedDoctorName: assignedDoctor?.name || null,
          scheduledDate: doc.scheduledDate || null,
          scheduledTime: doc.scheduledTime || null,
          createdAt: new Date(doc.createdAt).toISOString(),
          updatedAt: new Date(doc.updatedAt).toISOString(),
        };
      }),
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

/**
 * Server function for admins to fetch all consultation requests across all patients.
 */
export const getAllConsultationsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return { success: false as const, error: "Unauthorized: Admin access required." };
    }

    await connectToDatabase();
    const docs = await Consultation.find()
      .sort({ createdAt: -1 })
      .populate("assignedDoctorId", "name specialty city")
      .populate("claimedByAdminId", "name email")
      .lean();

    return {
      success: true as const,
      currentAdminId: String(user._id),
      consultations: docs.map((doc) => {
        const assignedDoctor = doc.assignedDoctorId as unknown as
          | { _id: unknown; name: string; specialty: string; city: string }
          | undefined;
        const claimedBy = doc.claimedByAdminId as unknown as
          | { _id: unknown; name: string; email: string }
          | undefined;
        return {
          id: String(doc._id),
          name: doc.name,
          phone: doc.phone,
          email: doc.email || "",
          treatment: doc.treatment,
          category: doc.category,
          city: doc.city,
          message: doc.message || "",
          status: doc.status,
          assignedDoctorId: assignedDoctor ? String(assignedDoctor._id) : null,
          assignedDoctorName: assignedDoctor?.name || null,
          scheduledDate: doc.scheduledDate || null,
          scheduledTime: doc.scheduledTime || null,
          claimedByAdminId: claimedBy ? String(claimedBy._id) : null,
          claimedByAdminName: claimedBy?.name || null,
          claimedAt: doc.claimedAt ? new Date(doc.claimedAt).toISOString() : null,
          createdAt: new Date(doc.createdAt).toISOString(),
          updatedAt: new Date(doc.updatedAt).toISOString(),
        };
      }),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { success: false as const, error: errMessage };
  }
});

export interface UpdateConsultationStatusInput {
  id: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
}

/**
 * Server function for admins to change booking status.
 */
export const updateConsultationStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as UpdateConsultationStatusInput)
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "admin") {
        return { success: false as const, error: "Unauthorized: Admin access required." };
      }

      await connectToDatabase();
      const existing = await Consultation.findById(data.id);
      if (!existing) {
        return { success: false as const, error: "Consultation record not found." };
      }
      const claimError = assertClaimOwnership(existing, user._id);
      if (claimError) return claimError;

      existing.status = data.status;
      await existing.save();

      return { success: true as const, message: `Status updated to ${data.status}!` };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

export interface AssignConsultationInput {
  id: string;
  doctorId: string;
  scheduledDate: string;
  scheduledTime: string;
}

/**
 * Server function for admins to assign a doctor and appointment slot to a booking.
 * The admin picks the doctor and time manually (no automated scheduling) — this just
 * records that decision and flips the booking to "scheduled".
 */
export const assignConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as AssignConsultationInput)
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "admin") {
        return { success: false as const, error: "Unauthorized: Admin access required." };
      }

      if (!data.doctorId || !data.scheduledDate || !data.scheduledTime) {
        return { success: false as const, error: "Doctor, date, and time are all required." };
      }

      await connectToDatabase();

      const existing = await Consultation.findById(data.id);
      if (!existing) {
        return { success: false as const, error: "Consultation record not found." };
      }
      const claimError = assertClaimOwnership(existing, user._id);
      if (claimError) return claimError;

      const doctor = await Doctor.findById(data.doctorId);
      if (!doctor) {
        return { success: false as const, error: "Selected doctor could not be found." };
      }

      existing.assignedDoctorId = doctor._id;
      existing.scheduledDate = data.scheduledDate;
      existing.scheduledTime = data.scheduledTime;
      existing.status = "scheduled";
      await existing.save();

      return { success: true as const, message: `Assigned to ${doctor.name}.` };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

/**
 * Server function for admins to delete a consultation.
 */
export const deleteConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "admin") {
        return { success: false as const, error: "Unauthorized: Admin access required." };
      }

      await connectToDatabase();
      const existing = await Consultation.findById(data.id);
      if (!existing) {
        return { success: false as const, error: "Consultation record not found." };
      }
      const claimError = assertClaimOwnership(existing, user._id);
      if (claimError) return claimError;

      await existing.deleteOne();
      return { success: true as const, message: "Consultation deleted successfully." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

/**
 * Server function for an admin to claim a booking from the shared queue. Atomic —
 * only succeeds if nobody else has claimed it yet, so two admins can't grab the same one.
 */
export const claimConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "admin") {
        return { success: false as const, error: "Unauthorized: Admin access required." };
      }

      await connectToDatabase();
      const claimed = await Consultation.findOneAndUpdate(
        { _id: data.id, claimedByAdminId: null },
        { claimedByAdminId: user._id, claimedAt: new Date() },
        { new: true },
      ).populate("claimedByAdminId", "name email");

      if (!claimed) {
        const existing = await Consultation.findById(data.id).populate(
          "claimedByAdminId",
          "name",
        );
        const claimedBy = existing?.claimedByAdminId as unknown as { name: string } | undefined;
        return {
          success: false as const,
          error: claimedBy
            ? `Already claimed by ${claimedBy.name}.`
            : "Consultation record not found.",
        };
      }

      return { success: true as const, message: "Booking claimed — it's yours to handle." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });

/**
 * Server function for an admin to release a claimed booking back to the shared queue.
 * Any admin may release (not just the claimant), so a booking never gets permanently
 * stuck if whoever claimed it goes on leave or leaves the team.
 */
export const releaseConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { id: string })
  .handler(async ({ data }) => {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "admin") {
        return { success: false as const, error: "Unauthorized: Admin access required." };
      }

      await connectToDatabase();
      const updated = await Consultation.findByIdAndUpdate(
        data.id,
        { $unset: { claimedByAdminId: "", claimedAt: "" } },
        { new: true },
      );

      if (!updated) {
        return { success: false as const, error: "Consultation record not found." };
      }

      return { success: true as const, message: "Released back to the shared queue." };
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : String(error);
      return { success: false as const, error: errMessage };
    }
  });
