import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Matches the real `reviews` collection restored from prod-sixdoctar (247,574 real patient
 * reviews, keyed by doctorId) — field names are taken directly from that data. See CLAUDE.md
 * "Data model" for context on the wider restore this belongs to.
 */
export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  rating: number;
  comment: string;
  doctorResponse?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
    doctorResponse: { type: String },
    responseDate: { type: Date },
  },
  { timestamps: true, strict: false, collection: "reviews" },
);

ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review: Model<IReview> =
  (mongoose.models["Review"] as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema);
