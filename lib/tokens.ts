import { randomBytes } from "crypto";

export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

export function manageBookUrl(token: string): string {
  return `/manage/${token}`;
}

export function borrowRequestUrl(token: string): string {
  return `/request/${token}`;
}

export function manageExchangeUrl(token: string): string {
  return `/exchange/manage/${token}`;
}
