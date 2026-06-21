import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || "").trim();
    const location = String(body.location || "").trim();
    const district = String(body.district || "").trim();
    const state = String(body.state || "Kerala").trim();
    const reporterName = String(body.reporterName || "").trim();
    const reporterContact = String(body.reporterContact || "").trim() || undefined;
    const address = String(body.address || location).trim() || location;

    if (!name || !location || !district || !reporterName) {
      return Response.json(
        { error: "Name, location, district, and your name are required" },
        { status: 400 },
      );
    }

    let latitude =
      body.latitude != null ? parseFloat(String(body.latitude)) : undefined;
    let longitude =
      body.longitude != null ? parseFloat(String(body.longitude)) : undefined;

    if (
      latitude == null ||
      longitude == null ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      return Response.json(
        { error: "Please select the library location on the map" },
        { status: 400 },
      );
    }

    const library = await Library.create({
      name,
      location,
      district,
      state,
      address,
      latitude,
      longitude,
      curatorName: reporterName,
      curatorContact: reporterContact,
      libraryType: "public",
      source: "reported",
      coverEmoji: "📚",
      bookCount: 0,
      approvalStatus: "pending",
    });

    return Response.json(
      {
        message:
          "Thanks for the report! We'll review it and add it to the map soon.",
        id: library._id,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Failed to submit library report" },
      { status: 400 },
    );
  }
}
