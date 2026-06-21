import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
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
    const sponsorship = await Sponsorship.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!sponsorship) {
      return Response.json({ error: "Sponsorship not found" }, { status: 404 });
    }
    return Response.json(sponsorship);
  } catch {
    return Response.json(
      { error: "Failed to update sponsorship" },
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
    const sponsorship = await Sponsorship.findByIdAndDelete(id);
    if (!sponsorship) {
      return Response.json({ error: "Sponsorship not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete sponsorship" },
      { status: 500 },
    );
  }
}
