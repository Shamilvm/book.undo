import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { toPublicBook } from "@/lib/book-serialize";
import { toPublicBorrowRequest } from "@/lib/borrow-serialize";
import { markBookReturnedViaManageToken } from "@/lib/borrow-manage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();
    const { token } = await params;
    const book = await Book.findOne({ manageToken: token });
    if (!book) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const requests = await BorrowRequest.find({ bookId: book._id }).sort({
      createdAt: -1,
    });

    return Response.json({
      book: {
        ...toPublicBook(book),
        status: book.status,
        manageUrl: `/manage/${token}`,
      },
      requests: requests.map(toPublicBorrowRequest),
    });
  } catch {
    return Response.json({ error: "Failed to load listing" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();
    const { token } = await params;
    const { action } = (await req.json()) as { action?: "mark_returned" };

    if (action !== "mark_returned") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await markBookReturnedViaManageToken(token);
    if (!result) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    return Response.json(result);
  } catch {
    return Response.json({ error: "Failed to update listing" }, { status: 400 });
  }
}
