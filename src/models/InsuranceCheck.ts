import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Public "check my insurance eligibility" submissions. Original schema — no real prod collection
 * to match (same situation as Question). Status changes happen via direct DB edit for now, same
 * gap Consultation had before its admin panel existed.
 */
export interface IInsuranceCheck extends Document {
  name: string;
  phone: string;
  city: string;
  condition: string;
  insurer: string;
  policyNumber?: string;
  status: "pending" | "checked";
  eligible?: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceCheckSchema = new Schema<IInsuranceCheck>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    insurer: { type: String, required: true, trim: true },
    policyNumber: { type: String, trim: true },
    status: { type: String, enum: ["pending", "checked"], default: "pending" },
    eligible: { type: Boolean },
    notes: { type: String },
  },
  { timestamps: true },
);

InsuranceCheckSchema.index({ status: 1, createdAt: -1 });

export const InsuranceCheck: Model<IInsuranceCheck> =
  (mongoose.models["InsuranceCheck"] as Model<IInsuranceCheck>) ||
  mongoose.model<IInsuranceCheck>("InsuranceCheck", InsuranceCheckSchema);
