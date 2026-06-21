import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { TextbookExchangeListing } from "@/lib/models/TextbookExchangeListing";
import {
  forbiddenResponse,
  requireAdmin,
  requireSuperAdmin,
  unauthorizedResponse,
} from "@/lib/auth";
import type { ExchangeListingStatus } from "@/lib/types/textbook-exchange";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const body = (await req.json()) as { status?: ExchangeListingStatus };

    if (body.status !== "listed" && body.status !== "unlisted") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const listing = await TextbookExchangeListing.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true, runValidators: true },
    );
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }
    return Response.json(listing);
  } catch {
    return Response.json(
      { error: "Failed to update listing" },
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
    const listing = await TextbookExchangeListing.findByIdAndDelete(id);
    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: "Failed to delete listing" },
      { status: 500 },
    );
  }
}
