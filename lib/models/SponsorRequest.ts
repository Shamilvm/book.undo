import mongoose, { Document, Schema } from "mongoose";
import type { SponsorOfferType, SponsorRequestStatus } from "@/lib/types";

export type { SponsorOfferType, SponsorRequestStatus };

export interface ISponsorRequest extends Document {
  sponsorshipId: mongoose.Types.ObjectId;
  schoolName: string;
  sponsorName: string;
  sponsorContact: string;
  offerType: SponsorOfferType;
  details?: string;
  message?: string;
  booksCommitted?: number;
  moneyAmount?: string;
  status: SponsorRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorRequestSchema = new Schema<ISponsorRequest>(
  {
    sponsorshipId: {
      type: Schema.Types.ObjectId,
      ref: "Sponsorship",
      required: true,
    },
    schoolName: { type: String, required: true, trim: true },
    sponsorName: { type: String, required: true, trim: true },
    sponsorContact: { type: String, required: true, trim: true },
    offerType: {
      type: String,
      enum: ["books", "money"],
      required: true,
    },
    details: { type: String, trim: true },
    message: { type: String, trim: true },
    booksCommitted: { type: Number, min: 0 },
    moneyAmount: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "contacted", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

if (process.env.NODE_ENV === "development" && mongoose.models.SponsorRequest) {
  delete mongoose.models.SponsorRequest;
}

export const SponsorRequest =
  mongoose.model<ISponsorRequest>("SponsorRequest", sponsorRequestSchema);
