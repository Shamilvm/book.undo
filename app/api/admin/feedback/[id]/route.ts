import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/Feedback";
import {
  forbiddenResponse,
  requireAdmin,
  requireSuperAdmin,
  unauthorizedResponse,
} from "@/lib/auth";
import type { FeedbackStatus, FeedbackType } from "@/lib/types/feedback";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const body = (await req.json()) as {
      name?: string;
      contact?: string;
      type?: FeedbackType;
      message?: string;
      status?: FeedbackStatus;
    };
    const update: Record<string, unknown> = {};
    if (body.name !== undefined) update.name = body.name.trim();
    if (body.contact !== undefined) update.contact = body.contact.trim();
    if (body.type !== undefined) update.type = body.type;
    if (body.message !== undefined) update.message = body.message.trim();
    if (body.status !== undefined) update.status = body.status;

    const feedback = await Feedback.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!feedback) {
      return Response.json({ error: "Feedback not found" }, { status: 404 });
    }
    return Response.json(feedback);
  } catch {
    return Response.json(
      { error: "Failed to update feedback" },
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
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return Response.json({ error: "Feedback not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}
