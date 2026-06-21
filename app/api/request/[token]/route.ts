import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { Book } from "@/lib/models/Book";
import { toPublicBorrowRequest } from "@/lib/borrow-serialize";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();
    const { token } = await params;
    const request = await BorrowRequest.findOne({ requestToken: token });
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const book = await Book.findById(request.bookId);
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const base = toPublicBorrowRequest(request);
    const showPickup = request.status === "approved";

    return Response.json({
      ...base,
      requestUrl: `/request/${token}`,
      book: {
        title: book.title,
        author: book.author,
        location: book.location,
        district: book.district,
        coverEmoji: book.coverEmoji,
        listedBy: book.anonymous ? "A neighbour" : book.donorName,
        pickupContact: showPickup ? book.donorContact : undefined,
        pickupLocation: showPickup
          ? `${book.location}, ${book.district}`
          : undefined,
      },
    });
  } catch {
    return Response.json({ error: "Failed to load request" }, { status: 500 });
  }
}
