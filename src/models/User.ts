import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: "patient" | "admin";
  totpSecret?: string | null;
  totpEnabled?: boolean;
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
    totpSecret: { type: String, default: null, select: false },
    totpEnabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (mongoose.models["User"] as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
