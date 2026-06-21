import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Sponsorship } from "@/lib/models/Sponsorship";
import {
  getFundedBooksBySponsorship,
  withComputedProgress,
} from "@/lib/sponsorship-progress";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const filter: Record<string, unknown> = {
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
      ],
    };
    const district = searchParams.get("district");
    const status = searchParams.get("status");
    if (district) filter.district = district;
    if (status) filter.status = status;

    const sponsorships = await Sponsorship.find(filter).sort({ createdAt: -1 });
    const fundedMap = await getFundedBooksBySponsorship(
      sponsorships.map((s) => s._id),
    );

    return Response.json(
      sponsorships.map((s) =>
        withComputedProgress(s.toObject(), fundedMap),
      ),
    );
  } catch {
    return Response.json(
      { error: "Failed to fetch sponsorships" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const sponsorship = await Sponsorship.create(body);
    return Response.json(sponsorship, { status: 201 });
  } catch {
    return Response.json(
      { error: "Failed to create sponsorship" },
      { status: 400 },
    );
  }
}
