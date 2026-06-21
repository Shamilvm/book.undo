import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Feedback } from "@/lib/models/Feedback";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(feedback);
  } catch {
    return Response.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}
