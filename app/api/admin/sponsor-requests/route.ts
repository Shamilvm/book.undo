import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { SponsorRequest } from "@/lib/models/SponsorRequest";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const requests = await SponsorRequest.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    return Response.json(requests);
  } catch {
    return Response.json(
      { error: "Failed to fetch sponsor requests" },
      { status: 500 },
    );
  }
}
