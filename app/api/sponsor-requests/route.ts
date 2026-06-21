import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
import { SponsorRequest } from "@/lib/models/SponsorRequest";
import type { SponsorRequestInput } from "@/lib/types/sponsor-request";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = (await req.json()) as SponsorRequestInput;

    const sponsorshipId = String(body.sponsorshipId || "").trim();
    const sponsorName = String(body.sponsorName || "").trim();
    const sponsorContact = String(body.sponsorContact || "").trim();
    const offerType = body.offerType;
    const details = String(body.details || "").trim() || undefined;
    const message = String(body.message || "").trim() || undefined;

    if (!sponsorshipId || !sponsorName || !sponsorContact) {
      return Response.json(
        { error: "School, your name, and contact are required" },
        { status: 400 },
      );
    }

    if (offerType !== "books" && offerType !== "money") {
      return Response.json(
        { error: "Please choose books or money" },
        { status: 400 },
      );
    }

    const sponsorship = await Sponsorship.findById(sponsorshipId);
    if (!sponsorship) {
      return Response.json({ error: "School not found" }, { status: 404 });
    }

    const request = await SponsorRequest.create({
      sponsorshipId,
      schoolName: sponsorship.schoolName,
      sponsorName,
      sponsorContact,
      offerType,
      details,
      message,
      status: "pending",
    });

    return Response.json(
      {
        message:
          "Thanks! We'll reach out to connect you with the school — no payment is taken here.",
        id: request._id,
      },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { error: "Failed to submit sponsor request" },
      { status: 400 },
    );
  }
}
