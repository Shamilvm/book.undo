import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { haversineKm } from "@/lib/haversine";
import { toPublicBook } from "@/lib/book-serialize";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusKm = parseFloat(searchParams.get("radius") || "10");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || undefined;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json(
        { error: "lat and lng query params are required" },
        { status: 400 },
      );
    }

    const filter: Record<string, unknown> = {
      approvalStatus: "approved",
      status: "available",
      isTextbook: { $ne: true },
      category: { $ne: "textbook" },
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };
    if (search) filter.$text = { $search: search };

    const books = await Book.find(filter)
      .select("-donorContact -manageToken")
      .lean();

    const nearby = books
      .map((book) => ({
        ...book,
        distance: haversineKm(
          lat,
          lng,
          book.latitude!,
          book.longitude!,
        ),
      }))
      .filter((book) => book.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map(toPublicBook);

    return Response.json(nearby);
  } catch {
    return Response.json(
      { error: "Failed to fetch nearby books" },
      { status: 500 },
    );
  }
}
