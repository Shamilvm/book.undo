import type { BorrowStatus } from "@/lib/types/borrow";
import type { BookStatus } from "@/lib/types/book";

export function bookStatusForBorrowStatus(
  status: BorrowStatus,
): BookStatus | null {
  if (status === "approved") return "borrowed";
  if (status === "returned" || status === "cancelled") return "available";
  return null;
}
