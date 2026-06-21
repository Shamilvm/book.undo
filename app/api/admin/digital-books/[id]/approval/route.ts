import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { DigitalBook } from "@/lib/models/DigitalBook";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import type { ApprovalStatus } from "@/lib/types/approval";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const { approvalStatus } = (await req.json()) as {
      approvalStatus: ApprovalStatus;
    };
    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return Response.json({ error: "Invalid approval status" }, { status: 400 });
    }
    const book = await DigitalBook.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true },
    );
    if (!book) {
      return Response.json({ error: "Digital book not found" }, { status: 404 });
    }
    return Response.json(book);
  } catch {
    return Response.json(
      { error: "Failed to update digital book approval" },
      { status: 400 },
    );
  }
}
