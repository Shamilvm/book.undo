import { unstable_cache } from "next/cache";

const USER_AGENT = "BookUndo/1.0 (library map; https://bookundo.org)";

export const KERALA_BBOX = {
  south: 8.0,
  west: 74.8,
  north: 12.8,
  east: 77.5,
};

export interface Bbox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface OsmLibrary {
  osmId: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function queryOverpass(bbox: Bbox): Promise<OsmLibrary[]> {
  const { south, west, north, east } = bbox;
  const query = `
[out:json][timeout:25];
(
  node["amenity"="library"](${south},${west},${north},${east});
  way["amenity"="library"](${south},${west},${north},${east});
);
out center;
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) return [];

  const json = (await res.json()) as { elements?: OverpassElement[] };
  const libraries: OsmLibrary[] = [];

  for (const el of json.elements ?? []) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    libraries.push({
      osmId: `${el.type}/${el.id}`,
      name,
      lat,
      lng,
      city:
        tags["addr:city"] ||
        tags["addr:district"] ||
        tags["addr:suburb"] ||
        tags["addr:place"] ||
        "",
      state: tags["addr:state"] || "Kerala",
    });
  }

  return libraries;
}

export const fetchOsmLibraries = unstable_cache(
  async (bboxKey: string) => {
    const [south, west, north, east] = bboxKey.split(",").map(Number);
    return queryOverpass({ south, west, north, east });
  },
  ["osm-libraries"],
  { revalidate: 86400 },
);

export function bboxKey(bbox: Bbox) {
  return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
}

export async function getOsmLibraries(bbox: Bbox = KERALA_BBOX) {
  try {
    return await fetchOsmLibraries(bboxKey(bbox));
  } catch {
    return [];
  }
}
