import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import type { ApprovalStatus } from "@/lib/types/approval";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const approvalStatus = req.nextUrl.searchParams.get("approvalStatus");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("libraryId", "name location district");

    return Response.json(books);
  } catch {
    return Response.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const body = await req.json();
    const book = await Book.create({
      ...body,
      approvalStatus: "approved",
    });

    if (book.libraryId) {
      await Library.findByIdAndUpdate(book.libraryId, {
        $inc: { bookCount: 1 },
      });
    }

    return Response.json(book, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create book" }, { status: 400 });
  }
}
