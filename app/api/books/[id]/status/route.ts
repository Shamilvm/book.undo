import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    const book = await Book.findByIdAndUpdate(id, { status }, { new: true });
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    return Response.json(book);
  } catch {
    return Response.json(
      { error: "Failed to update book status" },
      { status: 400 },
    );
  }
}
