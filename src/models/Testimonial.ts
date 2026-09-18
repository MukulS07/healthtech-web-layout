import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITestimonial extends Document {
  patientName: string;
  quote: string;
  rating: string;
  city: string;
  doctorId?: Types.ObjectId;
  treatmentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    patientName: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    rating: { type: String, required: true, default: "5.0" },
    city: { type: String, required: true, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    treatmentId: { type: Schema.Types.ObjectId, ref: "Treatment" },
  },
  { timestamps: true },
);

export const Testimonial: Model<ITestimonial> =
  (mongoose.models["Testimonial"] as Model<ITestimonial>) ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
