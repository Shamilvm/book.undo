import mongoose, { Document, Schema } from "mongoose";
import type { ApprovalStatus } from "@/lib/types/approval";

export interface IDigitalBook extends Document {
  title: string;
  author: string;
  genre: string;
  coverEmoji: string;
  url: string;
  pdfUrl?: string;
  approvalStatus: ApprovalStatus;
  submittedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const digitalBookSchema = new Schema<IDigitalBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    coverEmoji: { type: String, default: "📚" },
    url: { type: String, required: true, trim: true },
    pdfUrl: { type: String, trim: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedBy: { type: String, trim: true },
  },
  { timestamps: true },
);

digitalBookSchema.index({ approvalStatus: 1 });
digitalBookSchema.index({ title: "text", author: "text" });

export const DigitalBook =
  (mongoose.models.DigitalBook as mongoose.Model<IDigitalBook>) ||
  mongoose.model<IDigitalBook>("DigitalBook", digitalBookSchema);
