export type MapSpotSource = "bookundo" | "osm" | "reported";

export interface MapSpot {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  books: number;
  city: string;
  state: string;
  source: MapSpotSource;
}
