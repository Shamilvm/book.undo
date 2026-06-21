import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/Feedback";
import type { FeedbackInput } from "@/lib/types/feedback";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, contact, type, message } =
      (await req.json()) as FeedbackInput;

    if (!name?.trim() || !message?.trim()) {
      return Response.json(
        { error: "Name and message are required" },
        { status: 400 },
      );
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      contact: contact?.trim() || "",
      type: type || "suggestion",
      message: message.trim(),
    });

    return Response.json(feedback, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to submit feedback" },
      { status: 400 },
    );
  }
}
