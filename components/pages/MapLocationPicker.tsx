"use client";

import { useEffect, useRef } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";

const DEFAULT_CENTER: [number, number] = [10.85, 76.27];
const DEFAULT_ZOOM = 8;

interface MapLocationPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function MapLocationPicker({
  value,
  onChange,
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const mapReadyRef = useRef(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    aliveRef.current = true;
    mapReadyRef.current = false;
    let map: LeafletMap | undefined;
    let cancelled = false;
    let resizeTimer: number | undefined;

    function clearMarker() {
      if (!markerRef.current) return;
      try {
        markerRef.current.remove();
      } catch {
        /* map may already be destroyed */
      }
      markerRef.current = null;
    }

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !aliveRef.current || !mapRef.current) return;

      map = L.map(mapRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      map.on("click", (e) => {
        onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      map.whenReady(() => {
        if (cancelled || !aliveRef.current || !map) return;

        resizeTimer = window.setTimeout(() => {
          if (cancelled || !aliveRef.current || !map) return;
          try {
            map!.invalidateSize();
          } catch {
            /* ignore layout errors during dialog open */
          }
          mapReadyRef.current = true;
          if (value) {
            void syncMarker(map!, value);
          }
        }, 200);
      });
    }

    async function syncMarker(
      targetMap: LeafletMap,
      coords: { lat: number; lng: number },
    ) {
      if (cancelled || !aliveRef.current || mapInstanceRef.current !== targetMap) {
        return;
      }

      const L = (await import("leaflet")).default;
      if (cancelled || !aliveRef.current || mapInstanceRef.current !== targetMap) {
        return;
      }

      clearMarker();

      try {
        markerRef.current = L.circleMarker([coords.lat, coords.lng], {
          radius: 11,
          color: "#fff",
          weight: 3,
          fillColor: "#1f5c3d",
          fillOpacity: 1,
        }).addTo(targetMap);

        targetMap.setView(
          [coords.lat, coords.lng],
          Math.max(targetMap.getZoom(), 13),
          { animate: false },
        );
      } catch {
        /* ignore if map pane is not ready */
      }
    }

    initMap();

    return () => {
      cancelled = true;
      aliveRef.current = false;
      mapReadyRef.current = false;
      if (resizeTimer != null) {
        window.clearTimeout(resizeTimer);
      }
      clearMarker();
      mapInstanceRef.current = null;
      if (map) {
        try {
          map.off();
          map.remove();
        } catch {
          /* ignore teardown errors */
        }
      }
      map = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per mount
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReadyRef.current) return;

    if (!value) {
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch {
          /* ignore */
        }
        markerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    async function updateMarker() {
      const L = (await import("leaflet")).default;
      if (cancelled || !aliveRef.current || mapInstanceRef.current !== map) {
        return;
      }

      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch {
          /* ignore */
        }
        markerRef.current = null;
      }

      try {
        markerRef.current = L.circleMarker([value!.lat, value!.lng], {
          radius: 11,
          color: "#fff",
          weight: 3,
          fillColor: "#1f5c3d",
          fillOpacity: 1,
        }).addTo(map!);

        map!.setView(
          [value!.lat, value!.lng],
          Math.max(map!.getZoom(), 13),
          { animate: false },
        );
      } catch {
        /* ignore if map is mid-teardown */
      }
    }

    updateMarker();

    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div className="location-picker">
      <div
        ref={mapRef}
        className="location-picker-map"
        role="application"
        aria-label="Click to pin library location"
      />
    </div>
  );
}
