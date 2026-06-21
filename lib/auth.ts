import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  TOKEN_TTL_MS,
  type AdminSessionInfo,
  type AdminSessionRole,
  type AdminTokenPayload,
} from "@/lib/auth-constants";

export type { AdminSessionInfo, AdminSessionRole, AdminTokenPayload };
export { SESSION_COOKIE };

function getSecret(): string {
  return process.env.ADMIN_SECRET || "bookundo-dev-secret-change-me";
}

export function createAdminToken(session: AdminSessionInfo): string {
  const payload: AdminTokenPayload = {
    ...session,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function parseAdminToken(token: string): AdminTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString(),
    ) as AdminTokenPayload;
    if (payload.exp <= Date.now()) return null;
    if (payload.role !== "admin" && payload.role !== "super_admin") return null;
    if (!payload.userName) payload.userName = "admin";
    if (!payload.displayName) {
      payload.displayName =
        payload.role === "super_admin" ? "Super Admin" : "Admin";
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): boolean {
  return !!parseAdminToken(token);
}

export function checkAdminCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin";
  return username === expectedUser && password === expectedPass;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) return cookie;
  const header = req.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

export function getAdminSession(req: NextRequest): AdminTokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return parseAdminToken(token);
}

export function requireAdmin(req: NextRequest): boolean {
  return !!getAdminSession(req);
}

export function requireSuperAdmin(req: NextRequest): boolean {
  return getAdminSession(req)?.role === "super_admin";
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(TOKEN_TTL_MS / 1000);
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function jsonWithSession(session: AdminSessionInfo) {
  const token = createAdminToken(session);
  return Response.json(session, {
    headers: { "Set-Cookie": buildSessionCookie(token) },
  });
}

export function jsonClearSession(body: Record<string, unknown> = { ok: true }) {
  return Response.json(body, {
    headers: { "Set-Cookie": buildClearSessionCookie() },
  });
}
