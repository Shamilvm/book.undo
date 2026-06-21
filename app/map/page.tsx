import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import MapPage from "@/components/pages/MapPage";
import type { MapSpot } from "@/lib/types/map";
import { fetchMapSpots } from "@/lib/data";
import "@/styles/pages/map.css";

export const metadata: Metadata = {
  title: "Library map — Book Undo",
  description:
    "Find public libraries across Kerala — plus spots from OpenStreetMap and community reports.",
};

const fallbackSpots: MapSpot[] = [
  {
    id: "demo-1",
    name: "Kochi Public Library",
    type: "Public library",
    lat: 9.9312,
    lng: 76.2673,
    books: 48,
    city: "Kochi",
    state: "Kerala",
    source: "bookundo",
  },
];

export default async function MapRoute() {
  let allSpots: MapSpot[] = fallbackSpots;
  let bookundoSpots: MapSpot[] = fallbackSpots;
  let osmSpots: MapSpot[] = [];

  try {
    const data = await fetchMapSpots();
    if (data.allSpots.length) {
      allSpots = JSON.parse(JSON.stringify(data.allSpots)) as MapSpot[];
      bookundoSpots = JSON.parse(
        JSON.stringify(data.bookundoSpots),
      ) as MapSpot[];
      osmSpots = JSON.parse(JSON.stringify(data.osmSpots)) as MapSpot[];
    }
  } catch {
    /* DB or OSM unavailable */
  }

  const keralaSpots = bookundoSpots.filter((s) => s.state === "Kerala");
  const otherSpots = bookundoSpots.filter((s) => s.state !== "Kerala");
  const counts = {
    public: bookundoSpots.filter((s) => s.type === "Public library").length,
    osm: osmSpots.length,
  };

  return (
    <>
      <PageHero
        num="06"
        emoji="🗺️"
        eyebrow="Library map"
        title="Find a library near you"
        lead="Public libraries across Kerala, OpenStreetMap listings, and community reports — all on one map."
      />
      <MapPage
        allSpots={allSpots}
        bookundoSpots={bookundoSpots}
        osmSpots={osmSpots}
        keralaSpots={keralaSpots}
        otherSpots={otherSpots}
        counts={counts}
      />
    </>
  );
}
