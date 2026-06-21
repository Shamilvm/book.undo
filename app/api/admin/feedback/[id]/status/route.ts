import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/Feedback";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import type { FeedbackStatus } from "@/lib/types/feedback";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const { status } = (await req.json()) as { status: FeedbackStatus };
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

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
