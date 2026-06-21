import { connectDB } from "@/lib/db";
import { Book } from "@/lib/models/Book";
import { Library } from "@/lib/models/Library";
import { Sponsorship } from "@/lib/models/Sponsorship";
import { BorrowRequest } from "@/lib/models/BorrowRequest";
import { DigitalBook } from "@/lib/models/DigitalBook";
import { TextbookExchangeListing } from "@/lib/models/TextbookExchangeListing";
import {
  statsToDisplay,
  mapLibraryToSpot,
  libraryTypeLabel,
  formatCondition,
  formatCategory,
} from "@/lib/api";
import { toPublicBooks } from "@/lib/book-serialize";
import { haversineKm } from "@/lib/haversine";
import { getOsmLibraries } from "@/lib/osm";
import {
  getFundedBooksBySponsorship,
  withComputedProgress,
} from "@/lib/sponsorship-progress";
import type { AppStats } from "@/lib/types";
import type { MapSpot } from "@/lib/types/map";

const DEDUPE_RADIUS_KM = 0.15;

export interface MapSpotsData {
  allSpots: MapSpot[];
  bookundoSpots: MapSpot[];
  osmSpots: MapSpot[];
}

function osmToSpot(lib: {
  osmId: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}): MapSpot {
  return {
    id: `osm-${lib.osmId}`,
    name: lib.name,
    type: "Public library",
    lat: lib.lat,
    lng: lib.lng,
    books: 0,
    city: lib.city || lib.state,
    state: lib.state,
    source: "osm",
  };
}

function dedupeOsmSpots(bookundoSpots: MapSpot[], osmSpots: MapSpot[]) {
  return osmSpots.filter((osm) => {
    return !bookundoSpots.some(
      (bu) =>
        haversineKm(bu.lat, bu.lng, osm.lat, osm.lng) <= DEDUPE_RADIUS_KM,
    );
  });
}

export async function fetchStats() {
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
    Library.countDocuments({ approvalStatus: "approved" }),
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
  return statsToDisplay(stats);
}

export async function fetchBooks(params?: {
  status?: string;
  isTextbook?: boolean;
  limit?: number;
}) {
  await connectDB();
  const filter: Record<string, unknown> = {
    approvalStatus: "approved",
    status: params?.status || "available",
  };
  if (params?.isTextbook === true) {
    filter.isTextbook = true;
  } else if (params?.isTextbook === false) {
    filter.isTextbook = { $ne: true };
    filter.category = { $ne: "textbook" };
  }

  return toPublicBooks(
    await Book.find(filter)
      .sort({ createdAt: -1 })
      .limit(params?.limit || 50)
      .select("-donorContact -manageToken")
      .lean(),
  );
}

export async function fetchLibraries(district?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { approvalStatus: "approved" };
  if (district) filter.district = district;
  return Library.find(filter).sort({ createdAt: -1 }).lean();
}

export async function fetchMapSpots(): Promise<MapSpotsData> {
  const libs = await fetchLibraries();
  const bookundoSpots = libs
    .filter(
      (l) =>
        l.latitude != null &&
        l.longitude != null &&
        l.libraryType === "public",
    )
    .map((l) =>
      mapLibraryToSpot({
        _id: String(l._id),
        name: l.name,
        libraryType: l.libraryType,
        latitude: l.latitude,
        longitude: l.longitude,
        bookCount: l.bookCount,
        location: l.location,
        district: l.district,
        state: l.state,
        source: l.source,
        curatorName: l.curatorName,
        coverEmoji: l.coverEmoji,
      }),
    );

  const rawOsm = await getOsmLibraries();
  const osmSpots = dedupeOsmSpots(bookundoSpots, rawOsm.map(osmToSpot));

  return {
    bookundoSpots,
    osmSpots,
    allSpots: [...bookundoSpots, ...osmSpots],
  };
}

export async function fetchSponsorships() {
  await connectDB();
  const sponsorships = await Sponsorship.find({
    $or: [
      { approvalStatus: "approved" },
      { approvalStatus: { $exists: false } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const fundedMap = await getFundedBooksBySponsorship(
    sponsorships.map((s) => s._id),
  );

  return sponsorships.map((s) => withComputedProgress(s, fundedMap));
}

export async function fetchDigitalBooks() {
  await connectDB();
  return DigitalBook.find({ approvalStatus: "approved" })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function fetchTextbookExchangeListings(params?: {
  listingType?: "offer" | "need";
  limit?: number;
}) {
  await connectDB();
  const filter: Record<string, unknown> = { status: "listed" };
  if (params?.listingType) filter.listingType = params.listingType;

  return TextbookExchangeListing.find(filter)
    .sort({ createdAt: -1 })
    .limit(params?.limit || 50)
    .lean();
}

export { formatCondition, formatCategory, libraryTypeLabel };
