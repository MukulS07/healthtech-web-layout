import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Matches the real `hospitals` collection restored from prod-sixdoctar (2026-09-18) — see the
 * note at the top of Doctor.ts for why unconfirmed nested shapes are typed as Mixed.
 */
export interface IHospital extends Document {
  name: string;
  type?: string;
  registrationNumber?: string;
  registrationAuthority?: string;
  registrationYear?: number;
  owner?: unknown;
  ownershipType?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  locality?: string;
  landmark?: string;
  coordinates?: { latitude?: number; longitude?: number };
  amenities?: unknown;
  departments?: string[];
  services?: { name?: string }[];
  operatingHours?: unknown;
  emergency24x7?: boolean;
  emergencyContact?: string;
  totalBeds?: number;
  icuBeds?: number;
  insuranceAccepted?: unknown;
  accreditations?: unknown;
  awards?: unknown;
  description?: string;
  about?: string;
  logo?: string;
  logoPublicId?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  associatedMembers?: unknown[];
  isVerified?: boolean;
  isActive?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  verificationStatus?: string;
  rejectedMessage?: string;
  totalDoctors?: number;
  totalStaff?: number;
  slug: string;
  keywords?: unknown;
  socialMedia?: unknown;
  documents?: unknown;
  gallery?: unknown;
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    registrationAuthority: { type: String, trim: true },
    registrationYear: { type: Number },
    owner: { type: Schema.Types.Mixed },
    ownershipType: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    locality: { type: String, trim: true },
    landmark: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    amenities: { type: Schema.Types.Mixed },
    departments: [{ type: String }],
    services: [
      {
        name: { type: String },
      },
    ],
    operatingHours: { type: Schema.Types.Mixed },
    emergency24x7: { type: Boolean, default: false },
    emergencyContact: { type: String },
    totalBeds: { type: Number },
    icuBeds: { type: Number },
    insuranceAccepted: { type: Schema.Types.Mixed },
    accreditations: { type: Schema.Types.Mixed },
    awards: { type: Schema.Types.Mixed },
    description: { type: String },
    about: { type: String },
    logo: { type: String },
    logoPublicId: { type: String },
    coverImage: { type: String },
    coverImagePublicId: { type: String },
    associatedMembers: [{ type: Schema.Types.Mixed }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    verificationStatus: { type: String },
    rejectedMessage: { type: String },
    totalDoctors: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true, trim: true },
    keywords: { type: Schema.Types.Mixed },
    socialMedia: { type: Schema.Types.Mixed },
    documents: { type: Schema.Types.Mixed },
    gallery: { type: Schema.Types.Mixed },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true, strict: false },
);

HospitalSchema.index({ city: 1 });
HospitalSchema.index({ locality: 1 });
// Every hospital listing sorts by totalDoctors. Without an index Mongo has to sort the whole
// 34k-document match set in memory, which blows the 32MB limit once the skip gets deep — the
// directory died past page ~130 and sitemap-hospitals.xml came back empty. The city-prefixed
// index serves the filtered listings; the plain one serves the unfiltered listing and sitemap.
HospitalSchema.index({ totalDoctors: -1 });
HospitalSchema.index({ city: 1, totalDoctors: -1 });

export const Hospital: Model<IHospital> =
  (mongoose.models["Hospital"] as Model<IHospital>) ||
  mongoose.model<IHospital>("Hospital", HospitalSchema);
