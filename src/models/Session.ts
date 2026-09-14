import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISession extends Document {
  tokenHash: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    // SHA-256 of the cookie token — the raw token is never stored.
    tokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // TTL index: MongoDB removes the session once expiresAt has passed.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const Session: Model<ISession> =
  (mongoose.models["Session"] as Model<ISession>) ||
  mongoose.model<ISession>("Session", SessionSchema);
