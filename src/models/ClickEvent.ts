import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Call / WhatsApp / profile interaction log, written by `trackClickFn` from the public site.
 *
 * ⚠️ Privacy: this is deliberately the *minimum* that still answers "which listings get contacted".
 * We store NO IP address and NO user agent. `visitorId` is a random first-party id the browser
 * keeps in localStorage purely so "unique visitors" isn't just a count of clicks — it identifies a
 * browser, not a person, and clearing site data resets it. `userId` is only set when the visitor
 * is already logged in. Nothing here is shared with a third party; there is no analytics vendor.
 *
 * Events are never deleted by the app (see CLAUDE.md: nothing is deleted from the database).
 */
export type ClickType = "call" | "whatsapp" | "profile_click" | "directions" | "enquiry";
export type ClickTargetType = "doctor" | "hospital" | "site";

export interface IClickEvent extends Document {
  type: ClickType;
  targetType: ClickTargetType;
  /** Doctor/Hospital _id when the click was on a specific listing. */
  targetId?: Types.ObjectId;
  /** Name snapshotted at click time, so the log still reads correctly if the listing changes. */
  targetName?: string;
  /** Phone shown on the card at the time of the click (what the patient actually dialled). */
  targetPhone?: string;
  city?: string;
  /** Catalog speciality slug of the listing, where known — lets us break clicks down by speciality. */
  speciality?: string;
  /** Path the click happened on, e.g. "/doctors/dr-anita-rao". */
  sourcePage?: string;
  /** Interface language in use, so we can see whether the translated pages convert. */
  locale?: string;
  userId?: Types.ObjectId;
  visitorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    type: {
      type: String,
      enum: ["call", "whatsapp", "profile_click", "directions", "enquiry"],
      required: true,
    },
    targetType: { type: String, enum: ["doctor", "hospital", "site"], required: true },
    targetId: { type: Schema.Types.ObjectId },
    targetName: { type: String, trim: true },
    targetPhone: { type: String, trim: true },
    city: { type: String, trim: true },
    speciality: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    locale: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    visitorId: { type: String, trim: true },
  },
  { timestamps: true },
);

// The admin screen always filters on a date window first, then narrows by type/city/profile.
ClickEventSchema.index({ createdAt: -1 });
ClickEventSchema.index({ type: 1, createdAt: -1 });
ClickEventSchema.index({ targetId: 1, createdAt: -1 });
ClickEventSchema.index({ city: 1, createdAt: -1 });

export const ClickEvent: Model<IClickEvent> =
  (mongoose.models["ClickEvent"] as Model<IClickEvent>) ||
  mongoose.model<IClickEvent>("ClickEvent", ClickEventSchema);
