import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConsultation extends Document {
  userId?: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  treatmentId?: Types.ObjectId;
  /** Catalog reference, e.g. "t:laser-piles-surgery" / "c:piles" / "s:proctology". */
  interest?: string;
  preferredDate?: string;
  doctorName?: string;
  sourcePage?: string;
  consentAt?: Date;
  treatment: string;
  category: string;
  city: string;
  message?: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  assignedDoctorId?: Types.ObjectId;
  scheduledDate?: string;
  scheduledTime?: string;
  // Whichever admin is currently handling this booking. Set via an atomic claim so two
  // admins can't grab the same request; other admins are read-only on it until released.
  claimedByAdminId?: Types.ObjectId;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    // Set when the booking was made while logged in; guest bookings have no owner.
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    // Snapshotted from Treatment at booking time so this stays stable even if the
    // catalog entry is later renamed/re-categorized by an admin.
    // Legacy bookings reference the Treatment collection; new leads reference the curated catalog
    // via `interest` instead, so treatmentId is optional.
    treatmentId: { type: Schema.Types.ObjectId, ref: "Treatment" },
    interest: { type: String, trim: true },
    preferredDate: { type: String, trim: true },
    doctorName: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    consentAt: { type: Date },
    treatment: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    scheduledDate: { type: String, trim: true },
    scheduledTime: { type: String, trim: true },
    claimedByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    claimedAt: { type: Date },
  },
  { timestamps: true },
);

export const Consultation: Model<IConsultation> =
  (mongoose.models["Consultation"] as Model<IConsultation>) ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
