export type LibraryType = "public" | "sponsored";
export type LibrarySource = "registered" | "reported" | "admin";

export interface LibraryInput {
  name: string;
  description?: string;
  curatorName: string;
  curatorContact?: string;
  location: string;
  district: string;
  state?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPublic?: boolean;
  libraryType?: LibraryType;
  coverEmoji?: string;
}

export interface ReportLibraryInput {
  name: string;
  location: string;
  district: string;
  state?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  reporterName: string;
  reporterContact?: string;
}

export interface LibraryQuery {
  district?: string;
}

export interface NearbyLibraryQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}
