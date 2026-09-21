import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "patient" | "admin";
  /**
   * Suspended accounts can't log in and their live sessions are revoked, but the record and its
   * bookings stay — we never delete a patient (see CLAUDE.md). Suspension is reversible.
   */
  status?: "active" | "suspended";
  suspendedAt?: Date | null;
  suspendedReason?: string;
  /** Set on every successful login, so admins can see a real "last login" without reading sessions. */
  lastLoginAt?: Date | null;
  totpSecret?: string | null;
  totpEnabled?: boolean;
  failedLoginCount?: number;
  lockedUntil?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: false, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "admin"], default: "patient" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    suspendedAt: { type: Date, default: null },
    suspendedReason: { type: String, trim: true },
    lastLoginAt: { type: Date, default: null },
    totpSecret: { type: String, default: null, select: false },
    totpEnabled: { type: Boolean, default: false },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (mongoose.models["User"] as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
