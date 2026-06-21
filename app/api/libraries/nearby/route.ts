import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";
import { haversineKm } from "@/lib/haversine";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const radiusKm = parseFloat(searchParams.get("radius") || "100");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json(
        { error: "lat and lng query params are required" },
        { status: 400 },
      );
    }

    const libraries = await Library.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      approvalStatus: "approved",
    });

    const nearby = libraries
      .map((lib) => ({
        ...lib.toObject(),
        distance: haversineKm(lat, lng, lib.latitude!, lib.longitude!),
      }))
      .filter((lib) => lib.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return Response.json(nearby);
  } catch {
    return Response.json(
      { error: "Failed to fetch nearby libraries" },
      { status: 500 },
    );
  }
}
