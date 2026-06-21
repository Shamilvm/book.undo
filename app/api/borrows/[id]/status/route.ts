import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { Book } from "@/lib/models/Book";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    const request = await BorrowRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    if (status === "approved") {
      await Book.findByIdAndUpdate(request.bookId, { status: "borrowed" });
    } else if (status === "returned" || status === "cancelled") {
      await Book.findByIdAndUpdate(request.bookId, { status: "available" });
    }

    return Response.json(request);
  } catch {
    return Response.json({ error: "Failed to update request" }, { status: 400 });
  }
}
