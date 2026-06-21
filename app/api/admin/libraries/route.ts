import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const approvalStatus = req.nextUrl.searchParams.get("approvalStatus");
    const source = req.nextUrl.searchParams.get("source");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (source) filter.source = source;

    const libraries = await Library.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(libraries);
  } catch {
    return Response.json(
      { error: "Failed to fetch libraries" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const body = await req.json();
    const library = await Library.create({
      ...body,
      approvalStatus: "approved",
      source: body.source || "admin",
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
