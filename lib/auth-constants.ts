import type { UserRole } from "@/lib/types/user";

export const SESSION_COOKIE = "bookundo_admin_session";
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type AdminSessionRole = Extract<UserRole, "admin" | "super_admin">;

export interface AdminSessionInfo {
  role: AdminSessionRole;
  userName: string;
  displayName: string;
  buId?: string;
}

export interface AdminTokenPayload extends AdminSessionInfo {
  exp: number;
}
