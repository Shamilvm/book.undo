import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;
    const { booksCount = 1 } = await req.json();
    const sponsorship = await Sponsorship.findById(id);

    if (!sponsorship) {
      return Response.json({ error: "Sponsorship not found" }, { status: 404 });
    }

    sponsorship.booksFunded = Math.min(
      sponsorship.booksNeeded,
      sponsorship.booksFunded + booksCount,
    );

    if (sponsorship.booksFunded >= sponsorship.booksNeeded) {
      sponsorship.status = "funded";
    } else if (sponsorship.booksFunded > 0) {
      sponsorship.status = "partially_funded";
    }

    await sponsorship.save();
    return Response.json(sponsorship);
  } catch {
    return Response.json({ error: "Failed to contribute" }, { status: 400 });
  }
}
