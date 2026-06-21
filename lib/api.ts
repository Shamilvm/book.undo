const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed: ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export interface Book {
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
}

export interface Library {
  _id: string;
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
  libraryType?: string;
  source?: string;
  bookCount: number;
  coverEmoji: string;
  distance?: number;
}

export interface Sponsorship {
  _id: string;
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  booksFunded: number;
  subjects: string[];
  gradeRange: string;
  status: string;
  approvalStatus?: string;
  coverEmoji: string;
}

export interface SchoolListingInput {
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  gradeRange: string;
  contactName: string;
  contactPhone?: string;
  subjects?: string;
}

export interface AppStats {
  totalBooks: number;
  availableBooks: number;
  textbooks: number;
  libraries: number;
  openSponsorships: number;
  borrowRequests: number;
}

export interface BookInput {
  title: string;
  author: string;
  category?: string;
  condition?: string;
  description?: string;
  donorName: string;
  donorContact?: string;
  anonymous?: boolean;
  location: string;
  district: string;
  latitude?: number;
  longitude?: number;
  isTextbook?: boolean;
  grade?: string;
  subject?: string;
  board?: string;
  coverEmoji?: string;
}

export interface CreateBookResponse {
  book: Book;
  manageToken: string;
  manageUrl: string;
}

export interface LibraryInput {
  name: string;
  description?: string;
  curatorName: string;
  curatorContact?: string;
  location: string;
  district: string;
  address?: string;
  libraryType?: string;
  coverEmoji?: string;
}

export interface BorrowInput {
  bookId: string;
  borrowerName: string;
  borrowerContact: string;
  location: string;
  district?: string;
  latitude: number;
  longitude: number;
  message?: string;
}

export type BorrowStatus = "pending" | "approved" | "returned" | "cancelled";

export interface BorrowRequest {
  _id: string;
  bookId: string;
  borrowerName: string;
  borrowerContact: string;
  location: string;
  district?: string;
  latitude: number;
  longitude: number;
  message?: string;
  status: BorrowStatus;
  createdAt?: string;
}

export interface CreateBorrowResponse {
  request: BorrowRequest;
  requestToken: string;
  requestUrl: string;
}

export interface ManageBookData {
  book: Book & { manageUrl: string };
  requests: BorrowRequest[];
}

export interface RequestStatusData extends BorrowRequest {
  requestUrl: string;
  book?: {
    title: string;
    author: string;
    location: string;
    district: string;
    coverEmoji: string;
    listedBy?: string;
    pickupContact?: string;
    pickupLocation?: string;
  };
}

export function getStats() {
  return request<AppStats>("/api/stats");
}

export function getBooks(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    }
  }
  const query = qs.toString();
  return request<Book[]>(`/api/books${query ? `?${query}` : ""}`);
}

export function createBook(data: BookInput) {
  return request<CreateBookResponse>("/api/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getNearbyBooks(
  lat: number,
  lng: number,
  radius = 10,
  search?: string,
) {
  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });
  if (search) qs.set("search", search);
  return request<Book[]>(`/api/books/nearby?${qs}`);
}

export function getLibraries(district?: string) {
  const qs = district ? `?district=${encodeURIComponent(district)}` : "";
  return request<Library[]>(`/api/libraries${qs}`);
}

export function getNearbyLibraries(lat: number, lng: number, radius = 10) {
  return request<Library[]>(
    `/api/libraries/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
  );
}

export function createLibrary(data: LibraryInput) {
  return request<Library>("/api/libraries", {
    method: "POST",
    body: JSON.stringify(data),
  });
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

export function reportLibrary(data: ReportLibraryInput) {
  return request<{ message: string }>("/api/libraries/report", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getSponsorships(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return request<Sponsorship[]>(`/api/sponsorships${qs}`);
}

export function submitSchoolListing(data: SchoolListingInput) {
  return request<{ message: string; id: string }>("/api/sponsorships/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface SponsorRequestInput {
  sponsorshipId: string;
  sponsorName: string;
  sponsorContact: string;
  offerType: "books" | "money";
  details?: string;
  message?: string;
}

export function submitSponsorRequest(data: SponsorRequestInput) {
  return request<{ message: string; id: string }>("/api/sponsor-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function contributeToSponsorship(id: string, booksCount = 1) {
  return request<Sponsorship>(`/api/sponsorships/${id}/contribute`, {
    method: "POST",
    body: JSON.stringify({ booksCount }),
  });
}

export function createBorrowRequest(data: BorrowInput) {
  return request<CreateBorrowResponse>("/api/borrows", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getManageBook(token: string) {
  return request<ManageBookData>(`/api/manage/${token}`);
}

export function updateManageBorrow(
  token: string,
  borrowId: string,
  status: "approved" | "cancelled",
) {
  return request<{ book: Book; request: BorrowRequest }>(
    `/api/manage/${token}/borrows/${borrowId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function markBookReturned(token: string) {
  return request<{ book: Book }>(`/api/manage/${token}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "mark_returned" }),
  });
}

export function getBorrowRequestStatus(token: string) {
  return request<RequestStatusData>(`/api/request/${token}`);
}

export interface DigitalBook {
  _id: string;
  title: string;
  author: string;
  genre: string;
  coverEmoji: string;
  url: string;
  pdfUrl?: string;
}

export function getDigitalBooks(params?: { genre?: string; search?: string }) {
  const qs = new URLSearchParams();
  if (params?.genre) qs.set("genre", params.genre);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return request<DigitalBook[]>(
    `/api/digital-books${query ? `?${query}` : ""}`,
  );
}

export type FeedbackType = "suggestion" | "query" | "bug" | "other";

export interface FeedbackInput {
  name: string;
  contact?: string;
  type?: FeedbackType;
  message: string;
}

export type ExchangeListingType = "offer" | "need";

export interface TextbookExchangeListing {
  _id: string;
  listingType: ExchangeListingType;
  textbookDetails: string;
  grade?: string;
  subject?: string;
  board?: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string;
  district: string;
  status: string;
  coverEmoji: string;
  createdAt?: string;
}

export interface TextbookExchangeInput {
  listingType: ExchangeListingType;
  textbookDetails: string;
  grade?: string;
  subject?: string;
  board?: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string;
  district: string;
  latitude?: number;
  longitude?: number;
  coverEmoji?: string;
}

export interface CreateExchangeResponse {
  listing: TextbookExchangeListing;
  manageToken: string;
  manageUrl: string;
}

export function createFeedback(data: FeedbackInput) {
  return request<unknown>("/api/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getTextbookExchangeListings(params?: {
  listingType?: ExchangeListingType;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.listingType) qs.set("listingType", params.listingType);
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return request<TextbookExchangeListing[]>(
    `/api/textbook-exchange${query ? `?${query}` : ""}`,
  );
}

export function createTextbookExchangeListing(data: TextbookExchangeInput) {
  return request<CreateExchangeResponse>("/api/textbook-exchange", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getManageExchange(token: string) {
  return request<{ listing: TextbookExchangeListing; manageUrl: string }>(
    `/api/exchange/manage/${token}`,
  );
}

export function unlistExchange(token: string) {
  return request<{ listing: TextbookExchangeListing }>(
    `/api/exchange/manage/${token}`,
    {
      method: "PATCH",
      body: JSON.stringify({ action: "unlist" }),
    },
  );
}

export function submitDigitalBook(data: {
  title: string;
  author: string;
  genre: string;
  url: string;
  pdfUrl?: string;
  coverEmoji?: string;
  submittedBy?: string;
}) {
  return request<DigitalBook>("/api/digital-books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    new: "Like new",
    good: "Good",
    fair: "Well-loved",
    worn: "Well-loved",
  };
  return map[condition] || condition;
}

export function formatCategory(category: string): string {
  const map: Record<string, string> = {
    fiction: "Fiction",
    "non-fiction": "Non-fiction",
    "mystery-thriller": "Mystery & thriller",
    romance: "Romance",
    "sci-fi-fantasy": "Sci-fi & fantasy",
    "young-adult": "Young adult",
    children: "Children's",
    comics: "Comics & graphic novels",
    biography: "Biography & memoir",
    poetry: "Poetry",
    science: "Science & nature",
    history: "History",
    "self-help": "Self-help & wellness",
    spirituality: "Spirituality & religion",
    arts: "Arts & culture",
    regional: "Regional language",
    textbook: "Textbook",
    reference: "Reference",
    other: "Other",
  };
  return map[category] || category;
}

export function libraryTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    public: "Public library",
    sponsored: "Sponsored school",
  };
  return map[type || "public"] || "Public library";
}

export function mapLibraryToSpot(lib: Library) {
  const source =
    lib.source === "reported"
      ? ("reported" as const)
      : ("bookundo" as const);
  return {
    id: lib._id,
    name: lib.name,
    type: libraryTypeLabel(lib.libraryType),
    lat: lib.latitude ?? 10.85,
    lng: lib.longitude ?? 76.27,
    books: lib.bookCount,
    city: lib.location,
    state: lib.state || "Kerala",
    source,
  };
}

export function statsToDisplay(data: AppStats) {
  const paperTons = ((data.totalBooks * 0.5) / 1000).toFixed(1);
  return [
    {
      count: String(data.totalBooks),
      suffix: "+",
      label: "Books in circulation",
    },
    {
      count: String(data.libraries),
      suffix: "",
      label: "Libraries on the map",
    },
    {
      count: String(data.openSponsorships),
      suffix: "",
      label: "schools sponsored",
    },
    { count: paperTons, suffix: "t", label: "Paper waste avoided" },
  ];
}

export { API_URL };
