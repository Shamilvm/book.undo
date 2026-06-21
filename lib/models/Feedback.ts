import mongoose, { Document, Schema } from "mongoose";
import type { FeedbackStatus, FeedbackType } from "@/lib/types";

export type { FeedbackStatus, FeedbackType };

export interface IFeedback extends Document {
  name: string;
  contact: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["suggestion", "query", "bug", "other"],
      default: "suggestion",
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "resolved"],
      default: "new",
    },
  },
  { timestamps: true },
);

export const Feedback =
  (mongoose.models.Feedback as mongoose.Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", feedbackSchema);
