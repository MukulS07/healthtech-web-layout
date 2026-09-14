import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConsultation extends Document {
  userId?: Types.ObjectId;
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
    // Set when the booking was made while logged in; guest bookings have no owner.
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
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
  { timestamps: true },
);

export const Consultation: Model<IConsultation> =
  (mongoose.models["Consultation"] as Model<IConsultation>) ||
  mongoose.model<IConsultation>("Consultation", ConsultationSchema);
