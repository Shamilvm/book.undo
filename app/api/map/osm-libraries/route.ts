import { NextRequest } from "next/server";
import { getOsmLibraries, KERALA_BBOX } from "@/lib/osm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const bboxParam = searchParams.get("bbox");

    let bbox = KERALA_BBOX;
    if (bboxParam) {
      const parts = bboxParam.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        bbox = { south: parts[0], west: parts[1], north: parts[2], east: parts[3] };
      }
    }

    const libraries = await getOsmLibraries(bbox);
    return Response.json(libraries);
  } catch {
    return Response.json(
      { error: "Failed to fetch OSM libraries" },
      { status: 500 },
    );
  }
}
