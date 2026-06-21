import type { ApprovalStatus } from "./approval";

export type SponsorshipStatus =
  | "open"
  | "partially_funded"
  | "funded"
  | "delivered";

export interface SponsorshipInput {
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  booksFunded?: number;
  subjects?: string[];
  gradeRange: string;
  contactName: string;
  contactPhone?: string;
  status?: SponsorshipStatus;
  approvalStatus?: ApprovalStatus;
  coverEmoji?: string;
}

export interface SchoolListingInput {
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  gradeRange: string;
  contactName: string;
  contactPhone?: string;
  subjects?: string[];
}

export interface SponsorshipQuery {
  district?: string;
  status?: string;
}

export interface ContributeInput {
  booksCount?: number;
}
