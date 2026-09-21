import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Admin-managed FAQs, shown on top of the hand-written ones already in the curated catalog
 * (`src/data/catalog`). Catalog FAQs stay in code — they're part of the reviewed content — and
 * these are the ones the care team adds from real patient questions without a deploy.
 *
 * `pageType` + `pageSlug` say where an entry appears:
 *   general                 → /faqs
 *   speciality|condition|treatment|cost  → that catalog page (pageSlug = catalog slug)
 *   city                    → /locations/<slug>
 *   doctor|hospital         → that profile (pageSlug = listing slug)
 *
 * With no pageSlug, an entry applies to every page of that type.
 */
export type FaqPageType =
  | "general"
  | "speciality"
  | "condition"
  | "treatment"
  | "cost"
  | "city"
  | "doctor"
  | "hospital";

export const FAQ_PAGE_TYPES: FaqPageType[] = [
  "general",
  "speciality",
  "condition",
  "treatment",
  "cost",
  "city",
  "doctor",
  "hospital",
];

export interface IFaq extends Document {
  question: string;
  answer: string;
  pageType: FaqPageType;
  pageSlug?: string;
  /** Lower sorts first; ties fall back to creation order. */
  order: number;
  /** Draft entries are invisible to patients but kept — we don't delete, we unpublish. */
  status: "published" | "draft";
  createdByAdminId?: Types.ObjectId;
  updatedByAdminId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    pageType: { type: String, enum: FAQ_PAGE_TYPES, required: true, default: "general" },
    pageSlug: { type: String, trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    updatedByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    // NOT "faqs". That collection came with the imported archive and holds auto-generated local-SEO
    // Q&A that names specific clinics and quotes prices we have never verified ("Clinics such as
    // Apollo…"), which CLAUDE.md flags as unsafe to publish. Mongoose would have pluralised this
    // model onto it, so the admin FAQ screen would have listed those entries as ours and one click
    // would have put unverified claims about named hospitals in front of patients. Keeping our own
    // FAQs in their own collection means the two can never be confused.
    collection: "sitefaqs",
  },
);

FaqSchema.index({ pageType: 1, pageSlug: 1, status: 1, order: 1 });

export const Faq: Model<IFaq> =
  (mongoose.models["Faq"] as Model<IFaq>) || mongoose.model<IFaq>("Faq", FaqSchema);
