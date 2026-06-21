import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const requests = await BorrowRequest.find(filter)
      .populate("bookId", "title author location district coverEmoji donorName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(requests);
  } catch {
    return Response.json(
      { error: "Failed to fetch borrow requests" },
      { status: 500 },
    );
  }
}
