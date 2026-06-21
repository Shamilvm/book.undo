import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { Book } from "@/lib/models/Book";
import { bookStatusForBorrowStatus } from "@/lib/borrow-sync";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import type { BorrowStatus } from "@/lib/types/borrow";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const { status } = (await req.json()) as { status: BorrowStatus };
    const request = await BorrowRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const nextBookStatus = bookStatusForBorrowStatus(status);
    if (nextBookStatus) {
      await Book.findByIdAndUpdate(request.bookId, { status: nextBookStatus });
    }

    return Response.json(request);
  } catch {
    return Response.json({ error: "Failed to update request" }, { status: 400 });
  }
}
