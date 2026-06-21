import { Book } from "@/lib/models/Book";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { toPublicBook } from "@/lib/book-serialize";
import { toPublicBorrowRequest } from "@/lib/borrow-serialize";
import { bookStatusForBorrowStatus } from "@/lib/borrow-sync";
import { sendBorrowStatusNotification } from "@/lib/email";
import { borrowRequestUrl } from "@/lib/tokens";
import type { BorrowStatus } from "@/lib/types/borrow";

export async function updateBorrowViaManageToken(
  token: string,
  borrowId: string,
  status: BorrowStatus,
) {
  const book = await Book.findOne({ manageToken: token });
  if (!book) return null;

  const request = await BorrowRequest.findOne({
    _id: borrowId,
    bookId: book._id,
  });
  if (!request) return null;

  if (status === "approved" && request.status !== "pending") {
    return { error: "Only pending requests can be approved" as const };
  }
  if (status === "cancelled" && request.status !== "pending") {
    return { error: "Only pending requests can be declined" as const };
  }

  request.status = status;
  await request.save();

  const nextBookStatus = bookStatusForBorrowStatus(status);
  if (nextBookStatus) {
    book.status = nextBookStatus;
    await book.save();
  }

  if (status === "approved" || status === "cancelled") {
    await sendBorrowStatusNotification({
      contact: request.borrowerContact,
      bookTitle: book.title,
      status: status === "approved" ? "approved" : "cancelled",
      pickupLocation: `${book.location}, ${book.district}`,
      pickupContact: book.donorContact,
      requestUrl: borrowRequestUrl(request.requestToken),
    });
  }

  return {
    book: toPublicBook(book),
    request: toPublicBorrowRequest(request),
  };
}

export async function markBookReturnedViaManageToken(token: string) {
  const book = await Book.findOne({ manageToken: token });
  if (!book) return null;

  const active = await BorrowRequest.findOne({
    bookId: book._id,
    status: "approved",
  });

  if (active) {
    active.status = "returned";
    await active.save();
    await sendBorrowStatusNotification({
      contact: active.borrowerContact,
      bookTitle: book.title,
      status: "returned",
      requestUrl: borrowRequestUrl(active.requestToken),
    });
  }

  book.status = "available";
  await book.save();

  return { book: toPublicBook(book) };
}
