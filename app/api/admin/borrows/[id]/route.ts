import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { Book } from "@/lib/models/Book";
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
    const request = await BorrowRequest.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate("bookId", "title author coverEmoji");
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    return Response.json(request);
  } catch {
    return Response.json(
      { error: "Failed to update borrow request" },
      { status: 400 },
    );
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
    const request = await BorrowRequest.findByIdAndDelete(id);
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    if (request.status === "pending" || request.status === "approved") {
      await Book.findByIdAndUpdate(request.bookId, { status: "available" });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete borrow request" },
      { status: 500 },
    );
  }
}
