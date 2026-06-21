import type { ISponsorship } from "@/lib/models/Sponsorship";
import { SponsorRequest } from "@/lib/models/SponsorRequest";
import mongoose from "mongoose";

export function applySponsorshipProgress(
  sponsorship: ISponsorship,
  booksCount: number,
) {
  const currentFunded = sponsorship.booksFunded ?? 0;
  sponsorship.booksFunded = Math.min(
    sponsorship.booksNeeded,
    currentFunded + booksCount,
  );

  if (sponsorship.booksFunded >= sponsorship.booksNeeded) {
    sponsorship.status = "funded";
  } else if (sponsorship.booksFunded > 0) {
    sponsorship.status = "partially_funded";
  }
}

export async function getFundedBooksBySponsorship(
  ids: Array<mongoose.Types.ObjectId | string>,
) {
  if (!ids.length) return new Map<string, number>();

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(String(id)));
  const rows = await SponsorRequest.aggregate<{
    _id: mongoose.Types.ObjectId;
    total: number;
  }>([
    {
      $match: {
        sponsorshipId: { $in: objectIds },
        status: { $in: ["approved", "resolved"] },
      },
    },
    {
      $group: {
        _id: "$sponsorshipId",
        total: { $sum: { $ifNull: ["$booksCommitted", 0] } },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.total]));
}

export function withComputedProgress<
  T extends { _id: unknown; booksNeeded: number },
>(sponsorship: T, fundedMap: Map<string, number>): T & { booksFunded: number } {
  const funded = Math.min(
    sponsorship.booksNeeded,
    fundedMap.get(String(sponsorship._id)) ?? 0,
  );
  return { ...sponsorship, booksFunded: funded };
}
