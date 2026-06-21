import type { AdminTokenPayload } from "@/lib/auth-constants";

function getSecret(): string {
  return process.env.ADMIN_SECRET || "bookundo-dev-secret-change-me";
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return bufferToBase64Url(sig);
}

function base64UrlDecode(data: string): string {
  const padded = data + "=".repeat((4 - (data.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

export async function verifyAdminTokenEdge(
  token: string,
): Promise<AdminTokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = await hmacSign(data, getSecret());
  if (sig !== expected) return null;
  try {
    const json = base64UrlDecode(data);
    const payload = JSON.parse(json) as AdminTokenPayload;
    if (payload.exp <= Date.now()) return null;
    if (payload.role !== "admin" && payload.role !== "super_admin") return null;
    return payload;
  } catch {
    return null;
  }
}
