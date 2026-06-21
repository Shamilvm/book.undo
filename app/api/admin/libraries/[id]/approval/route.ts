import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Library } from "@/lib/models/Library";
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
    const library = await Library.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true },
    );
    if (!library) {
      return Response.json({ error: "Library not found" }, { status: 404 });
    }
    return Response.json(library);
  } catch {
    return Response.json(
      { error: "Failed to update library approval" },
      { status: 400 },
    );
  }
}
