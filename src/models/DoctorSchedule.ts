import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Matches the real `doctorschedules` collection restored from prod-sixdoctar (2026-09-18) — this
 * is the actual doctor↔hospital relationship (with consultation fee/availability), replacing the
 * guessed `Doctor.hospitalIds` array from the pre-import Phase 1 work.
 */
export interface IDoctorSchedule extends Document {
  doctor: Types.ObjectId;
  hospital: Types.ObjectId;
  weeklySchedule?: unknown;
  slotDuration?: number;
  consultationFee?: number;
  specialDates?: unknown[];
  allowOnlineBooking?: boolean;
  advanceBookingDays?: number;
  isActive?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospital: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    weeklySchedule: { type: Schema.Types.Mixed },
    slotDuration: { type: Number },
    consultationFee: { type: Number },
    specialDates: [{ type: Schema.Types.Mixed }],
    allowOnlineBooking: { type: Boolean, default: true },
    advanceBookingDays: { type: Number },
    isActive: { type: Boolean, default: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date, default: null },
    notes: { type: String },
  },
  { timestamps: true, strict: false },
);

DoctorScheduleSchema.index({ doctor: 1 });
DoctorScheduleSchema.index({ hospital: 1 });

export const DoctorSchedule: Model<IDoctorSchedule> =
  (mongoose.models["DoctorSchedule"] as Model<IDoctorSchedule>) ||
  mongoose.model<IDoctorSchedule>("DoctorSchedule", DoctorScheduleSchema);
