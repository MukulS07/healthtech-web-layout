import mongoose, { Schema, Document, Model } from "mongoose";

/** Newsletter / "Join the community" sign-ups. */
export interface ISubscriber extends Document {
  email: string;
  source?: string;
  unsubscribedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    source: { type: String, trim: true },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Subscriber: Model<ISubscriber> =
  (mongoose.models["Subscriber"] as Model<ISubscriber>) || mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
