import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
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
    const sponsorship = await Sponsorship.findByIdAndUpdate(
      id,
      { approvalStatus },
      { new: true },
    );
    if (!sponsorship) {
      return Response.json({ error: "Sponsorship not found" }, { status: 404 });
    }
    return Response.json(sponsorship);
  } catch {
    return Response.json(
      { error: "Failed to update sponsorship approval" },
      { status: 400 },
    );
  }
}
