import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Defined in lib/admin-constants (which imports nothing) so the admin screen can read the limit
// without importing this file and dragging Mongoose into the browser bundle.
export { MAX_PINNED_DOCTORS } from "@/lib/admin-constants";

/**
 * Editorially pinned doctors for a speciality in a city: they appear, in this order, ahead of the
 * normal ranking on /doctors?specialty=…&city=… and on /specialities/<slug>/<city>.
 *
 * One document per (speciality, city) holding an ordered list, so re-ordering is a single atomic
 * write and there is no way for two rows to disagree about position. `city` is the display name
 * used across the site ("Delhi NCR"), resolved to the real underlying values by city-aliases.
 *
 * Pinning is a promise to a patient that these are the surgeons we stand behind — only pin
 * doctors the care team has actually checked.
 */
export interface IDoctorRanking extends Document {
  speciality: string;
  city: string;
  doctorIds: Types.ObjectId[];
  updatedByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorRankingSchema = new Schema<IDoctorRanking>(
  {
    speciality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    doctorIds: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
    updatedByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

DoctorRankingSchema.index({ speciality: 1, city: 1 }, { unique: true });

export const DoctorRanking: Model<IDoctorRanking> =
  (mongoose.models["DoctorRanking"] as Model<IDoctorRanking>) ||
  mongoose.model<IDoctorRanking>("DoctorRanking", DoctorRankingSchema);
