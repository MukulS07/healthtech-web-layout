import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Matches the real `reviews` collection restored from prod-sixdoctar (247,574 real patient
 * reviews, keyed by doctorId) — field names are taken directly from that data. See CLAUDE.md
 * "Data model" for context on the wider restore this belongs to.
 */
export type ReviewFlag = "blank-doctor-name" | "duplicate-text" | "non-standard-rating";

export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientName: string;
  rating: number;
  comment: string;
  doctorResponse?: string;
  responseDate?: Date;
  /** Only set on reviews submitted through this site ("pending" until an admin approves).
   * Imported historical reviews have no status and are treated as published. */
  status?: "pending" | "approved" | "rejected";
  city?: string;
  treatment?: string;
  source?: string;
  /**
   * Why an imported review is held back (set by scripts/flag-reviews.ts together with
   * status "pending"). Nothing is deleted — `--undo` restores flagged reviews.
   */
  flagReason?: ReviewFlag[];
  flaggedAt?: Date;
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
    status: { type: String, enum: ["pending", "approved", "rejected"] },
    city: { type: String, trim: true },
    treatment: { type: String, trim: true },
    source: { type: String, trim: true },
    flagReason: { type: [String], default: undefined },
    flaggedAt: { type: Date },
  },
  { timestamps: true, strict: false, collection: "reviews" },
);

ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review: Model<IReview> =
  (mongoose.models["Review"] as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema);
