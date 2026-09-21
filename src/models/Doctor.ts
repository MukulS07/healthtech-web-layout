import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Matches the real `doctors` collection restored from prod-sixdoctar (2026-09-18) — field
 * names/shapes are taken directly from that data, not invented. Fields whose internal shape
 * wasn't confirmed are typed as Mixed rather than guessed, since `.lean()` reads bypass schema
 * casting anyway and a wrong guess would only make `createDoctorFn`/`updateDoctorFn` validation
 * wrong. See CLAUDE.md "Data model" for the mapping this replaces.
 */
export interface IDoctor extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  specialization?: string;
  specializationList?: string[];
  additionalSpecializations?: string[];
  qualification?: string;
  experience?: number;
  registrationNumber?: string;
  medicalCouncil?: string;
  registrationYear?: number;
  location?: string;
  locality?: string;
  coordinates?: { latitude?: number; longitude?: number };
  languages?: string[];
  bio?: string;
  homeVisitsAvailable?: boolean;
  homeVisitFee?: number;
  isSurgeon?: boolean;
  /** Slugs, e.g. "c-section", "myomectomy" — the real "type of surgery" taxonomy. */
  surgeryTypes?: string[];
  slug: string;
  gender?: string;
  dateOfBirth?: Date;
  rating?: { average?: number; count?: number };
  isActive?: boolean;
  isProfileVerified?: boolean;
  isDocumentsVerified?: boolean;
  isAdminVerified?: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  adminFeedback?: string;
  whatsappAvailable?: boolean;
  razorpayCustomerId?: string;
  seedSourceId?: string;
  seedSourceIdRaw?: string;
  seedHospitalSourceId?: string;
  awards?: unknown;
  extraData?: unknown;
  pastExperiences?: unknown;
  documents?: unknown;
  certifications?: unknown;
  gallery?: unknown;
  shorts?: unknown;
  shortsUrls?: unknown;
  videoUrls?: unknown;
  videos?: unknown;
  subscription?: unknown;
  weeklyAvailability?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    specialization: { type: String, trim: true },
    specializationList: [{ type: String }],
    additionalSpecializations: [{ type: String }],
    qualification: { type: String, trim: true },
    experience: { type: Number },
    registrationNumber: { type: String, trim: true },
    medicalCouncil: { type: String, trim: true },
    registrationYear: { type: Number },
    location: { type: String, trim: true },
    locality: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    languages: [{ type: String }],
    bio: { type: String },
    homeVisitsAvailable: { type: Boolean, default: false },
    homeVisitFee: { type: Number },
    isSurgeon: { type: Boolean, default: false },
    surgeryTypes: [{ type: String }],
    slug: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, trim: true },
    dateOfBirth: { type: Date },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    isProfileVerified: { type: Boolean, default: false },
    isDocumentsVerified: { type: Boolean, default: false },
    isAdminVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String },
    adminFeedback: { type: String },
    whatsappAvailable: { type: Boolean, default: false },
    razorpayCustomerId: { type: String },
    seedSourceId: { type: String },
    seedSourceIdRaw: { type: String },
    seedHospitalSourceId: { type: String },
    awards: { type: Schema.Types.Mixed },
    extraData: { type: Schema.Types.Mixed },
    pastExperiences: { type: Schema.Types.Mixed },
    documents: { type: Schema.Types.Mixed },
    certifications: { type: Schema.Types.Mixed },
    gallery: { type: Schema.Types.Mixed },
    shorts: { type: Schema.Types.Mixed },
    shortsUrls: { type: Schema.Types.Mixed },
    videoUrls: { type: Schema.Types.Mixed },
    videos: { type: Schema.Types.Mixed },
    subscription: { type: Schema.Types.Mixed },
    weeklyAvailability: { type: Schema.Types.Mixed },
  },
  { timestamps: true, strict: false },
);

DoctorSchema.index({ location: 1, surgeryTypes: 1 });
DoctorSchema.index({ specialization: 1 });
// Directory sorts (added 2026-09-19): "most reviewed first" and experience. Without these the
// listing sorted ~78k surgical doctors in memory (3–4 s per page); with them it's tens of ms.
DoctorSchema.index({ "rating.count": -1, createdAt: -1 });
DoctorSchema.index({ experience: -1 });
// "Rating: High to Low" used to fall through to the rating.count sort, so picking it changed
// nothing. It now sorts on the average, which needs its own index for the same reason.
DoctorSchema.index({ "rating.average": -1, "rating.count": -1 });

export const Doctor: Model<IDoctor> =
  (mongoose.models["Doctor"] as Model<IDoctor>) || mongoose.model<IDoctor>("Doctor", DoctorSchema);
