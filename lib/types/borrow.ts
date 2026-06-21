export type BorrowStatus = "pending" | "approved" | "returned" | "cancelled";

export interface BorrowInput {
  bookId: string;
  borrowerName: string;
  borrowerContact: string;
  location: string;
  district?: string;
  latitude: number;
  longitude: number;
  message?: string;
}

export interface BorrowStatusUpdate {
  status: BorrowStatus;
}
