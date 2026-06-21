import mongoose, { Document, Schema } from "mongoose";
import type { BorrowStatus } from "@/lib/types";
import { generateToken } from "@/lib/tokens";

export type { BorrowStatus };

export interface IBorrowRequest extends Document {
  bookId: mongoose.Types.ObjectId;
  borrowerName: string;
  borrowerContact: string;
  location: string;
  district?: string;
  latitude: number;
  longitude: number;
  message?: string;
  requestToken: string;
  status: BorrowStatus;
  createdAt: Date;
  updatedAt: Date;
}

const borrowRequestSchema = new Schema<IBorrowRequest>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    borrowerName: { type: String, required: true, trim: true },
    borrowerContact: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    message: { type: String, trim: true },
    requestToken: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "returned", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

borrowRequestSchema.pre("save", function () {
  if (!this.requestToken) {
    this.requestToken = generateToken();
  }
});

if (mongoose.models.BorrowRequest) {
  delete mongoose.models.BorrowRequest;
}

export const BorrowRequest =
  mongoose.model<IBorrowRequest>("BorrowRequest", borrowRequestSchema);
