import { createServerFn } from "@tanstack/react-start";
import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { Consultation, type IConsultation } from "@/models/Consultation";
import { Treatment } from "@/models/Treatment";
import { Doctor } from "@/models/Doctor";
import { getCondition, getSpeciality, getTreatment } from "@/data/catalog";
import { CALLBACK_PHRASE, CALLER, cap } from "@/lib/site";

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
  email?: string | undefined;
  /** Catalog reference: "t:<treatment>", "c:<condition>" or "s:<speciality>". */
  interest?: string | undefined;
  /** Legacy: an id from the Treatment collection. */
  treatmentId?: string | undefined;
  city: string;
  message?: string | undefined;
  preferredDate?: string | undefined;
  doctorName?: string | undefined;
  sourcePage?: string | undefined;
  consent?: boolean | undefined;
}

/** Normalises an Indian mobile number to 10 digits, or null if it isn't one. */
function normaliseIndianMobile(raw: string): string | null {
  const digits = String(raw || "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Resolves a catalog reference to the display name + category snapshot stored on the lead. */
function resolveInterest(ref?: string): { treatment: string; category: string } | null {
  if (!ref) return null;
  const [kind, slug] = ref.split(":");
  if (!slug) return null;
  if (kind === "t") {
    const t = getTreatment(slug);
    return t ? { treatment: t.name, category: getSpeciality(t.speciality)?.name ?? t.speciality } : null;
  }
  if (kind === "c") {
    const c = getCondition(slug);
    return c ? { treatment: c.name, category: getSpeciality(c.speciality)?.name ?? c.speciality } : null;
  }
  if (kind === "s") {
    const s = getSpeciality(slug);
    return s ? { treatment: `${s.name} consultation`, category: s.name } : null;
  }
  return null;
}

/**
 * Server function to submit a consultation request (lead). No account required — this is the
 * site's primary conversion point, and a login wall in front of it was losing enquiries. When the
 * visitor happens to be logged in, the lead is also linked to their account for /account.
 */
export const submitConsultationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitConsultationInput)
  .handler(async ({ data }) => {
    try {
      const name = String(data?.name || "").trim();
      const phone = normaliseIndianMobile(data?.phone);
      const city = String(data?.city || "").trim();
      if (name.length < 2) return { success: false as const, error: "Please enter your full name." };
      if (!phone) return { success: false as const, error: "Please enter a valid 10-digit mobile number." };
      if (!city) return { success: false as const, error: "Please select your city." };

      await connectToDatabase();

      // Look the treatment up server-side so the name/category snapshot can't be spoofed.
      let snapshot = resolveInterest(data.interest);
      let treatmentId: Types.ObjectId | undefined;
      if (!snapshot && data.treatmentId) {
        const treatment = await Treatment.findById(data.treatmentId).catch(() => null);
        if (treatment) {
          snapshot = { treatment: treatment.name, category: treatment.category };
          treatmentId = treatment._id as Types.ObjectId;
        }
      }
      if (!snapshot) return { success: false as const, error: "Please select a treatment or condition." };

      // Basic flood protection: one open lead per phone number per 10 minutes.
      const recent = await Consultation.exists({ phone, createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } });
      if (recent) {
        return {
          success: true as const,
          duplicate: true,
          message: "We already have your request — our care team will call you shortly.",
          linkedToAccount: false,
        };
      }

      const user = await getSessionUser();

      const consultation = await Consultation.create({
        ...(user ? { userId: user._id } : {}),
        ...(treatmentId ? { treatmentId } : {}),
        name: name.slice(0, 100),
        phone,
        email: String(data.email || "").trim().slice(0, 120),
        interest: data.interest || "",
        treatment: snapshot.treatment,
        category: snapshot.category,
        city: city.slice(0, 60),
        message: String(data.message || "").trim().slice(0, 2000),
        preferredDate: String(data.preferredDate || "").slice(0, 20),
        doctorName: String(data.doctorName || "").trim().slice(0, 100),
        sourcePage: String(data.sourcePage || "").slice(0, 200),
        ...(data.consent ? { consentAt: new Date() } : {}),
        status: "pending",
      });

      return {
        success: true as const,
        duplicate: false,
        id: String(consultation._id),
        message: `Request received! ${cap(CALLER)} will call you ${CALLBACK_PHRASE}.`,
        linkedToAccount: Boolean(user),
      };
    } catch (error: unknown) {
      console.error("Error saving consultation:", error);
      return {
        success: false as const,
        error: "We couldn't submit your request. Please try again or call us.",
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
    if (!isAdmin(user)) {
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
      if (!isAdmin(user)) {
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
      if (!isAdmin(user)) {
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

      const doctorName = [doctor.firstName, doctor.lastName].filter(Boolean).join(" ").trim() || "doctor";
      return { success: true as const, message: `Assigned to ${doctorName}.` };
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
      if (!isAdmin(user)) {
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
      if (!isAdmin(user)) {
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
      if (!isAdmin(user)) {
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
