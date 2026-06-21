import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";
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
    const library = await Library.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!library) {
      return Response.json({ error: "Library not found" }, { status: 404 });
    }
    return Response.json(library);
  } catch {
    return Response.json({ error: "Failed to update library" }, { status: 400 });
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
    const library = await Library.findByIdAndDelete(id);
    if (!library) {
      return Response.json({ error: "Library not found" }, { status: 404 });
    }
    await Book.deleteMany({ libraryId: library._id });
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete library" },
      { status: 500 },
    );
  }
}
