import mongoose, { Document, Schema } from "mongoose";
import type { ApprovalStatus, SponsorshipStatus } from "@/lib/types";

export type { SponsorshipStatus };

export interface ISponsorship extends Document {
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  booksFunded: number;
  subjects: string[];
  gradeRange: string;
  contactName: string;
  contactPhone?: string;
  status: SponsorshipStatus;
  approvalStatus: ApprovalStatus;
  coverEmoji: string;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorshipSchema = new Schema<ISponsorship>(
  {
    schoolName: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    booksNeeded: { type: Number, required: true, min: 1 },
    booksFunded: { type: Number, default: 0, min: 0 },
    subjects: [{ type: String, trim: true }],
    gradeRange: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "partially_funded", "funded", "delivered"],
      default: "open",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    coverEmoji: { type: String, default: "🏫" },
  },
  { timestamps: true }
);

export const Sponsorship =
  (mongoose.models.Sponsorship as mongoose.Model<ISponsorship>) ||
  mongoose.model<ISponsorship>("Sponsorship", sponsorshipSchema);
