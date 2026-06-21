import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { toPublicBook } from "@/lib/book-serialize";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const book = await Book.findById(id)
      .populate("libraryId", "name location district curatorName")
      .select("-donorContact -manageToken");
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    return Response.json(toPublicBook(book));
  } catch {
    return Response.json({ error: "Failed to fetch book" }, { status: 500 });
  }
}
