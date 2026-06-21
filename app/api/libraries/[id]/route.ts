import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";
import { Book } from "@/lib/models/Book";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const library = await Library.findById(id);
    if (!library) {
      return Response.json({ error: "Library not found" }, { status: 404 });
    }

    const books = await Book.find({
      libraryId: library._id,
      status: "available",
      approvalStatus: "approved",
    });
    return Response.json({ library, books });
  } catch {
    return Response.json(
      { error: "Failed to fetch library" },
      { status: 500 },
    );
  }
}
