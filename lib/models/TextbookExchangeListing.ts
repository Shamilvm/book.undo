import mongoose, { Document, Schema } from "mongoose";
import type {
  ExchangeListingStatus,
  ExchangeListingType,
} from "@/lib/types/textbook-exchange";
import { generateToken } from "@/lib/tokens";

export interface ITextbookExchangeListing extends Document {
  listingType: ExchangeListingType;
  textbookDetails: string;
  grade?: string;
  subject?: string;
  board?: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string;
  district: string;
  latitude?: number;
  longitude?: number;
  manageToken: string;
  status: ExchangeListingStatus;
  coverEmoji: string;
  createdAt: Date;
  updatedAt: Date;
}

const textbookExchangeListingSchema = new Schema<ITextbookExchangeListing>(
  {
    listingType: {
      type: String,
      enum: ["offer", "need"],
      required: true,
    },
    textbookDetails: { type: String, required: true, trim: true },
    grade: { type: String, trim: true },
    subject: { type: String, trim: true },
    board: { type: String, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    manageToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["listed", "unlisted"],
      default: "listed",
    },
    coverEmoji: { type: String, default: "📚" },
  },
  { timestamps: true },
);

textbookExchangeListingSchema.index({ status: 1, listingType: 1, createdAt: -1 });
textbookExchangeListingSchema.index({ district: 1, status: 1 });

textbookExchangeListingSchema.pre("save", function () {
  if (!this.manageToken) {
    this.manageToken = generateToken();
  }
});

export const TextbookExchangeListing =
  (mongoose.models
    .TextbookExchangeListing as mongoose.Model<ITextbookExchangeListing>) ||
  mongoose.model<ITextbookExchangeListing>(
    "TextbookExchangeListing",
    textbookExchangeListingSchema,
  );
