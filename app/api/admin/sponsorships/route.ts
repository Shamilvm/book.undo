import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const approvalStatus = req.nextUrl.searchParams.get("approvalStatus");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const sponsorships = await Sponsorship.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(sponsorships);
  } catch {
    return Response.json(
      { error: "Failed to fetch sponsorships" },
      { status: 500 },
    );
  }
}
