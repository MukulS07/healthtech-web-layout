import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConsultation extends Document {
  name: string;
  phone: string;
  email?: string;
  treatment: string;
  city: string;
  message?: string;
  status: "pending" | "contacted" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    treatment: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Consultation: Model<IConsultation> =
  (mongoose.models["Consultation"] as Model<IConsultation>) ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
