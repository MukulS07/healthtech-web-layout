import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICity extends Document {
  name: string;
  slug: string;
  state?: string;
  tagline?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, trim: true },
    state: { type: String, trim: true },
    tagline: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const City: Model<ICity> =
  (mongoose.models["City"] as Model<ICity>) || mongoose.model<ICity>("City", CitySchema);
