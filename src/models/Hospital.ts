import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHospital extends Document {
  name: string;
  slug: string;
  city: string;
  rating: string;
  beds: number;
  specialties: string[];
  img?: string;
  description?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    city: { type: String, required: true, trim: true },
    rating: { type: String, required: true, default: "4.7" },
    beds: { type: Number, required: true, default: 100 },
    specialties: [{ type: String }],
    img: { type: String },
    description: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

export const Hospital: Model<IHospital> =
  (mongoose.models["Hospital"] as Model<IHospital>) || mongoose.model<IHospital>("Hospital", HospitalSchema);
