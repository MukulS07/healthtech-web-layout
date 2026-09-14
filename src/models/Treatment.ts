import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITreatment extends Document {
  name: string;
  slug: string;
  category: string;
  description: string;
  recoveryTime?: string;
  benefits?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema = new Schema<ITreatment>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    recoveryTime: { type: String },
    benefits: [{ type: String }],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Treatment: Model<ITreatment> =
  (mongoose.models["Treatment"] as Model<ITreatment>) || mongoose.model<ITreatment>("Treatment", TreatmentSchema);
