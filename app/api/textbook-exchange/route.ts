import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TextbookExchangeListing } from "@/lib/models/TextbookExchangeListing";
import type { ExchangeListingType } from "@/lib/types/textbook-exchange";
import { generateToken, manageExchangeUrl } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const listingType = searchParams.get("listingType");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const filter: Record<string, unknown> = { status: "listed" };
    if (listingType === "offer" || listingType === "need") {
      filter.listingType = listingType;
    }

    const listings = await TextbookExchangeListing.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-manageToken")
      .lean();

    return Response.json(listings);
  } catch {
    return Response.json(
      { error: "Failed to fetch textbook exchange listings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as {
      listingType?: string;
      textbookDetails?: string;
      grade?: string;
      subject?: string;
      board?: string;
      contactName?: string;
      contactPhone?: string;
      address?: string;
      location?: string;
      district?: string;
      latitude?: number;
      longitude?: number;
      coverEmoji?: string;
    };

    if (
      !body.listingType ||
      !["offer", "need"].includes(body.listingType) ||
      !body.textbookDetails?.trim() ||
      !body.contactName?.trim() ||
      !body.contactPhone?.trim() ||
      !body.address?.trim() ||
      !body.location?.trim() ||
      !body.district?.trim()
    ) {
      return Response.json(
        { error: "Please fill in all required fields" },
        { status: 400 },
      );
    }

    const manageToken = generateToken();
    const listing = await TextbookExchangeListing.create({
      listingType: body.listingType as ExchangeListingType,
      textbookDetails: body.textbookDetails.trim(),
      grade: body.grade?.trim(),
      subject: body.subject?.trim(),
      board: body.board?.trim(),
      contactName: body.contactName.trim(),
      contactPhone: body.contactPhone.trim(),
      address: body.address.trim(),
      location: body.location.trim(),
      district: body.district.trim(),
      latitude: body.latitude,
      longitude: body.longitude,
      coverEmoji: body.coverEmoji || "📚",
      manageToken,
      status: "listed",
    });

    const obj = listing.toObject();
    delete (obj as { manageToken?: string }).manageToken;

    return Response.json(
      {
        listing: obj,
        manageToken,
        manageUrl: manageExchangeUrl(manageToken),
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Failed to post listing" },
      { status: 400 },
    );
  }
}
