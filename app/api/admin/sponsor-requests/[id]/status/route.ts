import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
import { SponsorRequest } from "@/lib/models/SponsorRequest";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { applySponsorshipProgress } from "@/lib/sponsorship-progress";
import type { SponsorRequestStatus } from "@/lib/types/sponsor-request";

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "Failed to update sponsor request";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const body = (await req.json()) as {
      status: SponsorRequestStatus;
      booksCommitted?: number;
      moneyAmount?: string;
      approvalNote?: string;
    };

    const allowed = [
      "pending",
      "approved",
      "rejected",
      "contacted",
      "resolved",
    ];
    if (!allowed.includes(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const request = await SponsorRequest.findById(id);
    if (!request) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    const previousStatus = request.status;

    if (body.status === "approved") {
      if (previousStatus !== "contacted") {
        return Response.json(
          { error: "Only contacted requests can be approved" },
          { status: 400 },
        );
      }

      const booksToAdd = body.booksCommitted;
      if (!booksToAdd || booksToAdd < 1) {
        return Response.json(
          { error: "Book count is required for approval" },
          { status: 400 },
        );
      }

      request.booksCommitted = booksToAdd;

      const moneyAmount = String(body.moneyAmount || "").trim();
      if (moneyAmount) {
        request.moneyAmount = moneyAmount;
      }

      const approvalNote = String(body.approvalNote || "").trim();
      if (approvalNote) {
        request.message = request.message
          ? `${request.message}\n\n[Approval note] ${approvalNote}`
          : `[Approval note] ${approvalNote}`;
      }

      const sponsorship = await Sponsorship.findById(request.sponsorshipId);
      if (sponsorship) {
        applySponsorshipProgress(sponsorship, booksToAdd);
        await sponsorship.save();
      }

      request.status = "approved";
      await request.save();
      return Response.json(request);
    }

    request.status = body.status;
    await request.save();
    return Response.json(request);
  } catch (err) {
    console.error("sponsor request status error:", err);
    return Response.json({ error: errorMessage(err) }, { status: 400 });
  }
}
