import { API_URL } from "./api";

const ROLE_KEY = "bookundo_admin_role";

export type AdminSessionRole = Extract<UserRole, "admin" | "super_admin">;

export interface AdminSession {
  role: AdminSessionRole;
  userName: string;
  displayName: string;
  buId?: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface AdminStats {
  pendingBooks: number;
  pendingLibraries: number;
  pendingReportedLibraries: number;
  pendingDigitalBooks: number;
  pendingBorrows: number;
  pendingSponsorRequests: number;
  newFeedback: number;
  totalBooks: number;
  totalLibraries: number;
  totalDigitalBooks: number;
  totalFeedback: number;
  totalPending: number;
}

export interface AdminBook {
  _id: string;
  title: string;
  author: string;
  category: string;
  condition: string;
  location: string;
  district: string;
  status: string;
  approvalStatus: ApprovalStatus;
  donorName: string;
  donorContact?: string;
  coverEmoji: string;
  isTextbook: boolean;
  createdAt: string;
}

export interface AdminLibrary {
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
  libraryType: string;
  source?: string;
  bookCount: number;
  coverEmoji: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
}

export interface DigitalBook {
  _id: string;
  title: string;
  author: string;
  genre: string;
  coverEmoji: string;
  url: string;
  pdfUrl?: string;
  approvalStatus: ApprovalStatus;
  submittedBy?: string;
  createdAt: string;
}

export interface AdminBorrow {
  _id: string;
  bookId: AdminBook | string | null;
  borrowerName: string;
  borrowerContact: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface AdminSponsorship {
  _id: string;
  schoolName: string;
  district: string;
  description: string;
  booksNeeded: number;
  booksFunded: number;
  gradeRange: string;
  contactName: string;
  contactPhone?: string;
  status: string;
  approvalStatus: string;
  coverEmoji: string;
  createdAt: string;
}

export interface AdminSponsorRequest {
  _id: string;
  sponsorshipId: string;
  schoolName: string;
  sponsorName: string;
  sponsorContact: string;
  offerType: "books" | "money";
  details?: string;
  message?: string;
  booksCommitted?: number;
  moneyAmount?: string;
  status: string;
  createdAt: string;
}

export type FeedbackType = "suggestion" | "query" | "bug" | "other";
export type FeedbackStatus = "new" | "read" | "resolved";

export type UserRole = "admin" | "super_admin" | "default";
export type UserStatus = "active" | "inactive";

export interface AdminUser {
  _id: string;
  userName: string;
  displayName: string;
  buId?: string;
  role: UserRole;
  status: UserStatus;
  email: string;
  phone?: string;
  notes?: string;
  hasPassword: boolean;
  createdAt: string;
}

export interface AdminFeedback {
  _id: string;
  name: string;
  contact: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface AdminTextbookExchangeListing {
  _id: string;
  listingType: "offer" | "need";
  textbookDetails: string;
  grade?: string;
  subject?: string;
  board?: string;
  contactName: string;
  contactPhone: string;
  address: string;
  location: string;
  district: string;
  status: "listed" | "unlisted";
  coverEmoji: string;
  createdAt: string;
}

function setAdminSession(session: AdminSession): void {
  sessionStorage.setItem(ROLE_KEY, session.role);
}

export function getAdminRole(): AdminSessionRole | null {
  if (typeof sessionStorage === "undefined") return null;
  const role = sessionStorage.getItem(ROLE_KEY);
  return role === "admin" || role === "super_admin" ? role : null;
}

export function isSuperAdmin(): boolean {
  return getAdminRole() === "super_admin";
}

function clearAdminSession(): void {
  sessionStorage.removeItem(ROLE_KEY);
}

async function adminRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    clearAdminSession();
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      window.location.href = "/admin/login";
    }
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed: ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Login failed");
  }
  const session = (await res.json()) as AdminSession;
  setAdminSession(session);
}

export function getAdminMe() {
  return adminRequest<AdminSession>("/api/admin/me");
}

export async function syncAdminSession(): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${API_URL}/api/admin/me`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      clearAdminSession();
      return null;
    }
    const session = (await res.json()) as AdminSession;
    setAdminSession(session);
    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    clearAdminSession();
    window.location.href = "/admin/login";
  }
}

export function getAdminStats() {
  return adminRequest<AdminStats>("/api/admin/stats");
}

export function getAdminBooks(approvalStatus?: ApprovalStatus) {
  const qs = approvalStatus ? `?approvalStatus=${approvalStatus}` : "";
  return adminRequest<AdminBook[]>(`/api/admin/books${qs}`);
}

export function createAdminBook(data: {
  title: string;
  author: string;
  donorName: string;
  donorContact?: string;
  condition: string;
  category: string;
  location: string;
  district: string;
  coverEmoji?: string;
}) {
  return adminRequest<AdminBook>("/api/admin/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function approveBook(id: string, approvalStatus: ApprovalStatus) {
  return adminRequest<AdminBook>(`/api/admin/books/${id}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }),
  });
}

export function deleteBook(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/books/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminBook(
  id: string,
  data: {
    title?: string;
    author?: string;
    donorName?: string;
    donorContact?: string;
    condition?: string;
    category?: string;
    location?: string;
    district?: string;
    status?: string;
    coverEmoji?: string;
  },
) {
  return adminRequest<AdminBook>(`/api/admin/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminLibraries(
  approvalStatus?: ApprovalStatus,
  source?: string,
) {
  const qs = new URLSearchParams();
  if (approvalStatus) qs.set("approvalStatus", approvalStatus);
  if (source) qs.set("source", source);
  const query = qs.toString();
  return adminRequest<AdminLibrary[]>(
    `/api/admin/libraries${query ? `?${query}` : ""}`,
  );
}

export function createAdminLibrary(data: {
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
  coverEmoji?: string;
}) {
  return adminRequest<AdminLibrary>("/api/admin/libraries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function approveLibrary(id: string, approvalStatus: ApprovalStatus) {
  return adminRequest<AdminLibrary>(`/api/admin/libraries/${id}/approval`, {
    method: "PATCH",
    body: JSON.stringify({ approvalStatus }),
  });
}

export function deleteLibrary(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/libraries/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminLibrary(
  id: string,
  data: {
    name?: string;
    description?: string;
    curatorName?: string;
    curatorContact?: string;
    location?: string;
    district?: string;
    state?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    libraryType?: string;
    coverEmoji?: string;
  },
) {
  return adminRequest<AdminLibrary>(`/api/admin/libraries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminDigitalBooks(approvalStatus?: ApprovalStatus) {
  const qs = approvalStatus ? `?approvalStatus=${approvalStatus}` : "";
  return adminRequest<DigitalBook[]>(`/api/admin/digital-books${qs}`);
}

export function createAdminDigitalBook(data: {
  title: string;
  author: string;
  genre: string;
  url: string;
  pdfUrl?: string;
  coverEmoji?: string;
}) {
  return adminRequest<DigitalBook>("/api/admin/digital-books", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function approveDigitalBook(id: string, approvalStatus: ApprovalStatus) {
  return adminRequest<DigitalBook>(
    `/api/admin/digital-books/${id}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    },
  );
}

export function deleteDigitalBook(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/digital-books/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminDigitalBook(
  id: string,
  data: {
    title?: string;
    author?: string;
    genre?: string;
    url?: string;
    pdfUrl?: string;
    coverEmoji?: string;
  },
) {
  return adminRequest<DigitalBook>(`/api/admin/digital-books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminBorrows(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return adminRequest<AdminBorrow[]>(`/api/admin/borrows${qs}`);
}

export function updateBorrowStatus(id: string, status: string) {
  return adminRequest<AdminBorrow>(`/api/admin/borrows/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteBorrow(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/borrows/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminBorrow(
  id: string,
  data: {
    borrowerName?: string;
    borrowerContact?: string;
    message?: string;
    status?: string;
  },
) {
  return adminRequest<AdminBorrow>(`/api/admin/borrows/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminSponsorships(
  status?: string,
  approvalStatus?: string,
) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (approvalStatus) qs.set("approvalStatus", approvalStatus);
  const query = qs.toString();
  return adminRequest<AdminSponsorship[]>(
    `/api/admin/sponsorships${query ? `?${query}` : ""}`,
  );
}

export function approveSponsorship(id: string, approvalStatus: ApprovalStatus) {
  return adminRequest<AdminSponsorship>(
    `/api/admin/sponsorships/${id}/approval`,
    {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus }),
    },
  );
}

export function updateSponsorshipStatus(id: string, status: string) {
  return adminRequest<AdminSponsorship>(
    `/api/admin/sponsorships/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function deleteSponsorship(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/sponsorships/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminSponsorship(
  id: string,
  data: {
    schoolName?: string;
    district?: string;
    description?: string;
    booksNeeded?: number;
    booksFunded?: number;
    gradeRange?: string;
    contactName?: string;
    contactPhone?: string;
    status?: string;
    coverEmoji?: string;
  },
) {
  return adminRequest<AdminSponsorship>(`/api/admin/sponsorships/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminSponsorRequests(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return adminRequest<AdminSponsorRequest[]>(
    `/api/admin/sponsor-requests${qs}`,
  );
}

export function updateSponsorRequestStatus(
  id: string,
  data: {
    status: string;
    booksCommitted?: number;
    moneyAmount?: string;
    approvalNote?: string;
  },
) {
  return adminRequest<AdminSponsorRequest>(
    `/api/admin/sponsor-requests/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function getAdminFeedback(status?: string, type?: string) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (type) qs.set("type", type);
  const query = qs.toString();
  return adminRequest<AdminFeedback[]>(
    `/api/admin/feedback${query ? `?${query}` : ""}`,
  );
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  return adminRequest<AdminFeedback>(`/api/admin/feedback/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteFeedback(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/feedback/${id}`, {
    method: "DELETE",
  });
}

export function updateAdminFeedback(
  id: string,
  data: {
    name?: string;
    contact?: string;
    type?: FeedbackType;
    message?: string;
    status?: FeedbackStatus;
  },
) {
  return adminRequest<AdminFeedback>(`/api/admin/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminTextbookExchangeListings(
  status?: string,
  listingType?: string,
) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (listingType) qs.set("listingType", listingType);
  const query = qs.toString();
  return adminRequest<AdminTextbookExchangeListing[]>(
    `/api/admin/textbook-exchange${query ? `?${query}` : ""}`,
  );
}

export function updateTextbookExchangeListingStatus(
  id: string,
  status: "listed" | "unlisted",
) {
  return adminRequest<AdminTextbookExchangeListing>(
    `/api/admin/textbook-exchange/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}

export function deleteTextbookExchangeListing(id: string) {
  return adminRequest<{ deleted: boolean }>(
    `/api/admin/textbook-exchange/${id}`,
    { method: "DELETE" },
  );
}

export function getAdminUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  buId?: string;
}) {
  const qs = new URLSearchParams();
  if (filters?.role) qs.set("role", filters.role);
  if (filters?.status) qs.set("status", filters.status);
  if (filters?.buId) qs.set("buId", filters.buId);
  const query = qs.toString();
  return adminRequest<AdminUser[]>(
    `/api/admin/users${query ? `?${query}` : ""}`,
  );
}

export function createAdminUser(data: {
  userName: string;
  displayName: string;
  buId?: string;
  role?: UserRole;
  status?: UserStatus;
  email: string;
  phone?: string;
  notes?: string;
  password?: string;
}) {
  return adminRequest<AdminUser>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdminUser(
  id: string,
  data: {
    userName?: string;
    displayName?: string;
    buId?: string;
    role?: UserRole;
    status?: UserStatus;
    email?: string;
    phone?: string;
    notes?: string;
    password?: string;
  },
) {
  return adminRequest<AdminUser>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAdminUser(id: string) {
  return adminRequest<{ deleted: boolean }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export function formatUserRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    admin: "Admin",
    super_admin: "Super admin",
    default: "Default",
  };
  return map[role] || role;
}

export function formatApprovalStatus(status: ApprovalStatus): string {
  const map: Record<ApprovalStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return map[status] || status;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
