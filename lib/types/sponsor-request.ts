export type SponsorOfferType = "books" | "money";

export type SponsorRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "contacted"
  | "resolved";

export interface SponsorRequestInput {
  sponsorshipId: string;
  sponsorName: string;
  sponsorContact: string;
  offerType: SponsorOfferType;
  details?: string;
  message?: string;
  booksCommitted?: number;
}
