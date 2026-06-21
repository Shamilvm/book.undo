import type { IBorrowRequest } from "@/lib/models/BorrowRequest";
import type { BorrowStatus } from "@/lib/types/borrow";

export type PublicBorrowRequest = {
  _id: string;
  bookId: string;
  borrowerName: string;
  borrowerContact: string;
  location: string;
  district?: string;
  latitude: number;
  longitude: number;
  message?: string;
  status: BorrowStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export function toPublicBorrowRequest(
  doc: IBorrowRequest | Record<string, unknown>,
): PublicBorrowRequest {
  const raw = "toObject" in doc && typeof doc.toObject === "function"
    ? doc.toObject()
    : { ...doc };

  const bookId = raw.bookId;
  const bookIdStr =
    bookId && typeof bookId === "object" && "_id" in bookId
      ? String((bookId as { _id: unknown })._id)
      : String(bookId);

  return {
    _id: String(raw._id),
    bookId: bookIdStr,
    borrowerName: String(raw.borrowerName),
    borrowerContact: String(raw.borrowerContact),
    location: String(raw.location ?? ""),
    district: raw.district ? String(raw.district) : undefined,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    message: raw.message ? String(raw.message) : undefined,
    status: raw.status as BorrowStatus,
    createdAt: raw.createdAt as Date | undefined,
    updatedAt: raw.updatedAt as Date | undefined,
  };
}

export type BorrowRequestStatusView = PublicBorrowRequest & {
  book?: {
    title: string;
    author: string;
    location: string;
    district: string;
    coverEmoji: string;
    pickupContact?: string;
    pickupNote?: string;
  };
};

export type CreateBorrowResponse = {
  request: PublicBorrowRequest;
  requestToken: string;
  requestUrl: string;
};
