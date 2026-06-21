import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import {
  forbiddenResponse,
  requireAdmin,
  requireSuperAdmin,
  unauthorizedResponse,
} from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const book = await Book.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    return Response.json(book);
  } catch {
    return Response.json({ error: "Failed to update book" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  if (!requireSuperAdmin(req)) return forbiddenResponse();
  try {
    await connectDB();
    const { id } = await params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }
    if (book.libraryId) {
      await Library.findByIdAndUpdate(book.libraryId, {
        $inc: { bookCount: -1 },
      });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
