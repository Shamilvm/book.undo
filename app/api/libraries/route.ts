import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const district = req.nextUrl.searchParams.get("district");
    const filter: Record<string, unknown> = { approvalStatus: "approved" };
    if (district) filter.district = district;

    const libraries = await Library.find(filter).sort({ createdAt: -1 });
    return Response.json(libraries);
  } catch {
    return Response.json(
      { error: "Failed to fetch libraries" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const library = await Library.create({
      ...body,
      source: body.source || "registered",
      state: body.state || "Kerala",
    });
    return Response.json(library, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to create library" },
      { status: 400 },
    );
  }
}
