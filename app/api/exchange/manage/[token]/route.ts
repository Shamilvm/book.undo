import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TextbookExchangeListing } from "@/lib/models/TextbookExchangeListing";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();
    const { token } = await params;
    const listing = await TextbookExchangeListing.findOne({
      manageToken: token,
    }).lean();
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const { manageToken: _t, ...publicListing } = listing;
    return Response.json({
      listing: publicListing,
      manageUrl: `/exchange/manage/${token}`,
    });
  } catch {
    return Response.json({ error: "Failed to load listing" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    await connectDB();
    const { token } = await params;
    const { action } = (await req.json()) as { action?: "unlist" };

    if (action !== "unlist") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const listing = await TextbookExchangeListing.findOneAndUpdate(
      { manageToken: token },
      { status: "unlisted" },
      { new: true },
    );
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const obj = listing.toObject();
    delete (obj as { manageToken?: string }).manageToken;
    return Response.json({ listing: obj });
  } catch {
    return Response.json({ error: "Failed to update listing" }, { status: 400 });
  }
}
