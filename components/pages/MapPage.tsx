"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
import type { MapSpot, MapSpotSource } from "@/lib/types/map";
import ReportLibraryForm from "@/components/pages/ReportLibraryForm";

export type { MapSpot, MapSpotSource };

interface MapPageProps {
  allSpots: MapSpot[];
  bookundoSpots: MapSpot[];
  osmSpots: MapSpot[];
  keralaSpots: MapSpot[];
  otherSpots: MapSpot[];
  counts: {
    public: number;
    osm: number;
  };
}

function dotClass(spot: MapSpot) {
  if (spot.source === "osm") return "dot dot-osm";
  const prefix = spot.type.split(" ")[0].toLowerCase();
  return `dot dot-${prefix}`;
}

function sourceLabel(source: MapSpotSource) {
  if (source === "osm") return "OpenStreetMap";
  if (source === "reported") return "Community report";
  return "Book Undo";
}

function popupHtml(spot: MapSpot) {
  const location = `${spot.city}${spot.city && spot.state ? ", " : ""}${spot.state}`;
  const sourceLine =
    spot.source === "osm"
      ? `<br><em>${sourceLabel(spot.source)}</em>`
      : "";
  return `<strong>${spot.name}</strong><br>${spot.type} · ${location}${sourceLine}`;
}

export default function MapPage({
  allSpots,
  bookundoSpots,
  osmSpots,
  keralaSpots,
  otherSpots,
  counts,
}: MapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, CircleMarker>>({});

  useEffect(() => {
    let map: LeafletMap | undefined;
    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const typeColors: Record<string, string> = {
        "Public library": "#1f5c3d",
        "Sponsored school": "#143f29",
      };

      map = L.map(mapRef.current, { scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markers: Record<string, CircleMarker> = {};
      allSpots.forEach((s) => {
        const isOsm = s.source === "osm";
        const m = L.circleMarker([s.lat, s.lng], {
          radius: isOsm ? 7 : 9,
          color: "#fff",
          weight: 2,
          fillColor: isOsm ? "#4a6fa5" : typeColors[s.type] || "#1f5c3d",
          fillOpacity: 0.95,
        })
          .addTo(map!)
          .bindPopup(popupHtml(s));
        markers[s.id] = m;
      });
      markersRef.current = markers;

      const keralaBounds = allSpots
        .filter((s) => s.state === "Kerala")
        .map((s) => [s.lat, s.lng] as [number, number]);
      if (keralaBounds.length) {
        map.fitBounds(keralaBounds, { padding: [48, 48], maxZoom: 8 });
      } else if (allSpots.length) {
        map.fitBounds(
          allSpots.map((s) => [s.lat, s.lng] as [number, number]),
          { padding: [48, 48], maxZoom: 8 },
        );
      } else {
        map.setView([10.85, 76.27], 7);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current = null;
      map?.remove();
    };
  }, [allSpots]);

  function flyToSpot(id: string) {
    const m = markersRef.current[id];
    const spot = allSpots.find((s) => s.id === id);
    const leafletMap = mapInstanceRef.current;
    if (m && spot && leafletMap) {
      leafletMap.flyTo([spot.lat, spot.lng], 12, { duration: 0.8 });
      m.openPopup();
    }
  }

  function renderSpotCard(spot: MapSpot, showState = false) {
    return (
      <button
        key={spot.id}
        type="button"
        className="card spot"
        onClick={() => flyToSpot(spot.id)}
      >
        <span className={dotClass(spot)} />
        <strong>{spot.name}</strong>
        <p className="muted small">
          {spot.type} · {spot.city}
          {showState && spot.state ? `, ${spot.state}` : ""}
        </p>
        {spot.source === "osm" && (
          <p className="muted small">{sourceLabel(spot.source)}</p>
        )}
      </button>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="legend reveal">
          <span className="leg leg-public">
            ● Public libraries · {counts.public}
          </span>
          <span className="leg leg-osm">● Map libraries · {counts.osm}</span>
        </div>

        <div className="map-wrap reveal">
          <div
            id="map"
            ref={mapRef}
            role="application"
            aria-label="Map of libraries"
          ></div>
        </div>

        <div className="spot-section reveal">
          <div className="section-head">
            <span className="eyebrow">
              Book Undo · {bookundoSpots.length} spots
            </span>
            <h2>Listed libraries</h2>
          </div>
          {bookundoSpots.length > 0 ? (
            <div className="grid grid-4 spot-list">
              {bookundoSpots.map((s) => renderSpotCard(s))}
            </div>
          ) : (
            <p className="muted">No Book Undo libraries on the map yet.</p>
          )}
        </div>

        {osmSpots.length > 0 && (
          <div className="spot-section spot-section--osm reveal">
            <div className="section-head">
              <span className="eyebrow">
                OpenStreetMap · {osmSpots.length} libraries
              </span>
              <h2>Public libraries on the map</h2>
            </div>
            <div className="grid grid-4 spot-list">
              {osmSpots.slice(0, 12).map((s) => renderSpotCard(s))}
            </div>
            {osmSpots.length > 12 && (
              <p className="muted small">
                Showing 12 of {osmSpots.length} — click markers on the map to
                explore more.
              </p>
            )}
          </div>
        )}

        {otherSpots.length > 0 && (
          <div className="spot-section reveal">
            <div className="section-head">
              <span className="eyebrow">
                Other states · {otherSpots.length} spots
              </span>
              <h2>Across India</h2>
            </div>
            <div className="grid grid-4 spot-list">
              {otherSpots.map((s) => renderSpotCard(s, true))}
            </div>
          </div>
        )}

        <div className="spot-section report-section reveal">
          <div className="section-head">
            <span className="eyebrow">Missing a library?</span>
            <h2>Report a library near you</h2>
            <p className="muted">
              Know a public library or reading room that isn&apos;t listed? Tell
              us and we&apos;ll add it after review.
            </p>
          </div>
          <div className="card form">
            <ReportLibraryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
