import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  slug: string;
  specialty: string;
  cred: string;
  exp: number;
  rating: string;
  city: string;
  img?: string;
  bio?: string;
  fees?: number;
  hospital?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    cred: { type: String, required: true, trim: true },
    exp: { type: Number, required: true },
    rating: { type: String, required: true, default: "4.8" },
    city: { type: String, required: true, trim: true },
    img: { type: String },
    bio: { type: String },
    fees: { type: Number },
    hospital: { type: String },
  },
  { timestamps: true },
);

export const Doctor: Model<IDoctor> =
  (mongoose.models["Doctor"] as Model<IDoctor>) || mongoose.model<IDoctor>("Doctor", DoctorSchema);
