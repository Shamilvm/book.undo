import type { IBook } from "@/lib/models/Book";

export type PublicBook = {
  _id: string;
  title: string;
  author: string;
  category: string;
  condition: string;
  location: string;
  district: string;
  status: string;
  isTextbook: boolean;
  grade?: string;
  subject?: string;
  board?: string;
  description?: string;
  coverEmoji: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  listedBy?: string;
  createdAt?: Date;
};

function donorDisplayName(doc: {
  donorName?: string;
  anonymous?: boolean;
}): string | undefined {
  if (doc.anonymous) return "A neighbour";
  return doc.donorName;
}

export function toPublicBook(
  doc: IBook | Record<string, unknown>,
): PublicBook {
  const raw = "toObject" in doc && typeof doc.toObject === "function"
    ? doc.toObject()
    : { ...doc };

  return {
    _id: String(raw._id),
    title: String(raw.title),
    author: String(raw.author),
    category: String(raw.category ?? "other"),
    condition: String(raw.condition ?? "good"),
    location: String(raw.location),
    district: String(raw.district),
    status: String(raw.status ?? "available"),
    isTextbook: Boolean(raw.isTextbook),
    grade: raw.grade ? String(raw.grade) : undefined,
    subject: raw.subject ? String(raw.subject) : undefined,
    board: raw.board ? String(raw.board) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    coverEmoji: String(raw.coverEmoji ?? "📚"),
    latitude: raw.latitude != null ? Number(raw.latitude) : undefined,
    longitude: raw.longitude != null ? Number(raw.longitude) : undefined,
    distance: raw.distance != null ? Number(raw.distance) : undefined,
    listedBy: donorDisplayName({
      donorName: raw.donorName ? String(raw.donorName) : undefined,
      anonymous: Boolean(raw.anonymous),
    }),
    createdAt: raw.createdAt as Date | undefined,
  };
}

export function toPublicBooks(
  docs: Array<IBook | Record<string, unknown>>,
): PublicBook[] {
  return docs.map(toPublicBook);
}

export type CreateBookResponse = {
  book: PublicBook;
  manageToken: string;
  manageUrl: string;
};
