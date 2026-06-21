import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TextbookExchangeListing } from "@/lib/models/TextbookExchangeListing";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");

    const filter: Record<string, unknown> = {};
    if (status === "listed" || status === "unlisted") filter.status = status;
    if (listingType === "offer" || listingType === "need") {
      filter.listingType = listingType;
    }

    const listings = await TextbookExchangeListing.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(listings);
  } catch {
    return Response.json(
      { error: "Failed to fetch textbook exchange listings" },
      { status: 500 },
    );
  }
}
