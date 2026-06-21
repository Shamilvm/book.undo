import mongoose, { Document, Schema } from "mongoose";
import type { BookCategory, BookCondition, BookStatus } from "@/lib/types";
import type { ApprovalStatus } from "@/lib/types/approval";
import { generateToken } from "@/lib/tokens";

export type { BookCategory, BookCondition, BookStatus };

export interface IBook extends Document {
  title: string;
  author: string;
  isbn?: string;
  category: BookCategory;
  description?: string;
  condition: BookCondition;
  bookLanguage: string;
  grade?: string;
  subject?: string;
  board?: string;
  donorName: string;
  donorContact?: string;
  anonymous: boolean;
  manageToken: string;
  latitude?: number;
  longitude?: number;
  location: string;
  district: string;
  status: BookStatus;
  isTextbook: boolean;
  libraryId?: mongoose.Types.ObjectId;
  coverEmoji: string;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "fiction",
        "non-fiction",
        "mystery-thriller",
        "romance",
        "sci-fi-fantasy",
        "young-adult",
        "children",
        "comics",
        "biography",
        "poetry",
        "science",
        "history",
        "self-help",
        "spirituality",
        "arts",
        "regional",
        "textbook",
        "reference",
        "other",
      ],
      default: "other",
    },
    description: { type: String, trim: true },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "worn"],
      default: "good",
    },
    bookLanguage: { type: String, default: "Malayalam" },
    grade: { type: String, trim: true },
    subject: { type: String, trim: true },
    board: { type: String, trim: true },
    donorName: { type: String, required: true, trim: true },
    donorContact: { type: String, trim: true },
    anonymous: { type: Boolean, default: false },
    manageToken: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      index: true,
    },
    latitude: { type: Number },
    longitude: { type: Number },
    location: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["available", "borrowed", "reserved"],
      default: "available",
    },
    isTextbook: { type: Boolean, default: false },
    libraryId: { type: Schema.Types.ObjectId, ref: "Library" },
    coverEmoji: { type: String, default: "📚" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

bookSchema.index({ approvalStatus: 1, status: 1 });
bookSchema.index({ district: 1, status: 1 });
bookSchema.index({ latitude: 1, longitude: 1 });
bookSchema.index({ isTextbook: 1, grade: 1, subject: 1 });
bookSchema.index({ title: "text", author: "text" });

bookSchema.pre("save", function () {
  if (!this.manageToken) {
    this.manageToken = generateToken();
  }
});

if (mongoose.models.Book) {
  delete mongoose.models.Book;
}

export const Book = mongoose.model<IBook>("Book", bookSchema);
