import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import { Sponsorship } from "@/lib/models/Sponsorship";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import type { AppStats } from "@/lib/types";

export async function GET() {
  try {
    await connectDB();
    const [
      totalBooks,
      availableBooks,
      textbooks,
      libraries,
      openSponsorships,
      borrowRequests,
    ] = await Promise.all([
      Book.countDocuments({ approvalStatus: "approved" }),
      Book.countDocuments({ status: "available", approvalStatus: "approved" }),
      Book.countDocuments({ isTextbook: true, approvalStatus: "approved" }),
      Library.countDocuments({
        approvalStatus: "approved",
        libraryType: { $in: ["public", "sponsored"] },
      }),
      Sponsorship.countDocuments({
        status: { $in: ["open", "partially_funded"] },
      }),
      BorrowRequest.countDocuments(),
    ]);

    const stats: AppStats = {
      totalBooks,
      availableBooks,
      textbooks,
      libraries,
      openSponsorships,
      borrowRequests,
    };

    return Response.json(stats);
  } catch {
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
