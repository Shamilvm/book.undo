import mongoose, { Document, Schema } from "mongoose";
import type { LibraryType } from "@/lib/types";
import type { ApprovalStatus } from "@/lib/types/approval";

export type { LibraryType };

export type LibrarySource = "registered" | "reported" | "admin";

export interface ILibrary extends Document {
  name: string;
  description?: string;
  curatorName: string;
  curatorContact?: string;
  location: string;
  district: string;
  state: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPublic: boolean;
  libraryType: LibraryType;
  bookCount: number;
  coverEmoji: string;
  source: LibrarySource;
  osmId?: string;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const librarySchema = new Schema<ILibrary>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    curatorName: { type: String, required: true, trim: true },
    curatorContact: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, default: "Kerala", trim: true },
    address: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    isPublic: { type: Boolean, default: true },
    libraryType: {
      type: String,
      enum: ["public", "sponsored"],
      default: "public",
    },
    bookCount: { type: Number, default: 0 },
    coverEmoji: { type: String, default: "🏠" },
    source: {
      type: String,
      enum: ["registered", "reported", "admin"],
      default: "registered",
    },
    osmId: { type: String, trim: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

librarySchema.index({ approvalStatus: 1 });
librarySchema.index({ source: 1 });
librarySchema.index({ district: 1 });
librarySchema.index({ latitude: 1, longitude: 1 });

export const Library =
  (mongoose.models.Library as mongoose.Model<ILibrary>) ||
  mongoose.model<ILibrary>("Library", librarySchema);
