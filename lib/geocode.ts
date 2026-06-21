const USER_AGENT = "BookUndo/1.0 (library map; https://bookundo.org)";

export async function geocodeAddress(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "in",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) return null;

  const data = (await res.json()) as { lat: string; lon: string }[];
  if (!data?.[0]) return null;

  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return { lat, lng };
}
