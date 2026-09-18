import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Public "Ask a Question" submissions. Original schema — the real prod-sixdoctar `questions`
 * collection exists but has 0 documents, so there was no real shape to match; this one is
 * designed fresh for this feature. Answering happens by editing `answer`/`status` directly for
 * now (no admin UI yet, same gap as Consultation had before its admin panel existed).
 */
export interface IQuestion extends Document {
  name: string;
  age?: number;
  gender?: string;
  phone: string;
  condition: string;
  message: string;
  status: "pending" | "answered";
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number },
    gender: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "answered"], default: "pending" },
    answer: { type: String },
    answeredBy: { type: String },
    answeredAt: { type: Date },
  },
  { timestamps: true },
);

QuestionSchema.index({ status: 1, createdAt: -1 });

export const Question: Model<IQuestion> =
  (mongoose.models["Question"] as Model<IQuestion>) ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
