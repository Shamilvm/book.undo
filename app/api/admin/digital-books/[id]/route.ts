import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { DigitalBook } from "@/lib/models/DigitalBook";
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
    const book = await DigitalBook.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return Response.json({ error: "Digital book not found" }, { status: 404 });
    }
    return Response.json(book);
  } catch {
    return Response.json(
      { error: "Failed to update digital book" },
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
    const book = await DigitalBook.findByIdAndDelete(id);
    if (!book) {
      return Response.json({ error: "Digital book not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete digital book" },
      { status: 500 },
    );
  }
}
