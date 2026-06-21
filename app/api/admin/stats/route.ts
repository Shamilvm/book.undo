import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import { DigitalBook } from "@/lib/models/DigitalBook";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { SponsorRequest } from "@/lib/models/SponsorRequest";
import { Feedback } from "@/lib/models/Feedback";
import { NextRequest } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const [
      pendingBooks,
      pendingLibraries,
      pendingReportedLibraries,
      pendingDigitalBooks,
      pendingBorrows,
      pendingSponsorRequests,
      newFeedback,
      totalBooks,
      totalLibraries,
      totalDigitalBooks,
      totalFeedback,
    ] = await Promise.all([
      Book.countDocuments({ approvalStatus: "pending" }),
      Library.countDocuments({ approvalStatus: "pending" }),
      Library.countDocuments({
        approvalStatus: "pending",
        source: "reported",
      }),
      DigitalBook.countDocuments({ approvalStatus: "pending" }),
      BorrowRequest.countDocuments({ status: "pending" }),
      SponsorRequest.countDocuments({ status: "pending" }),
      Feedback.countDocuments({ status: "new" }),
      Book.countDocuments(),
      Library.countDocuments(),
      DigitalBook.countDocuments(),
      Feedback.countDocuments(),
    ]);

    return Response.json({
      pendingBooks,
      pendingLibraries,
      pendingReportedLibraries,
      pendingDigitalBooks,
      pendingBorrows,
      pendingSponsorRequests,
      newFeedback,
      totalBooks,
      totalLibraries,
      totalDigitalBooks,
      totalFeedback,
      totalPending:
        pendingBooks +
        pendingLibraries +
        pendingDigitalBooks +
        pendingBorrows +
        pendingSponsorRequests +
        newFeedback,
    });
  } catch (err) {
    console.error("admin stats error:", err);
    return Response.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
