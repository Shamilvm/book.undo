import mongoose, { Document, Schema } from "mongoose";
import type { UserRole, UserStatus } from "@/lib/types/user";

export type { UserRole, UserStatus };

export interface IUser extends Document {
  userName: string;
  displayName: string;
  buId?: string;
  role: UserRole;
  status: UserStatus;
  email: string;
  phone?: string;
  notes?: string;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    displayName: { type: String, required: true, trim: true },
    buId: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "super_admin", "default"],
      default: "default",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    passwordHash: { type: String, select: false },
  },
  { timestamps: true },
);

userSchema.index({ buId: 1 });
userSchema.index({ role: 1, status: 1 });

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
