import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { DigitalBook } from "@/lib/models/DigitalBook";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const genre = searchParams.get("genre");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || "50";
    const filter: Record<string, unknown> = { approvalStatus: "approved" };

    if (genre && genre !== "All") filter.genre = genre;
    if (search) filter.$text = { $search: search };

    const books = await DigitalBook.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(books);
  } catch {
    return Response.json(
      { error: "Failed to fetch digital books" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const book = await DigitalBook.create({
      ...body,
      approvalStatus: "pending",
    });
    return Response.json(book, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to submit digital book" },
      { status: 400 },
    );
  }
}
