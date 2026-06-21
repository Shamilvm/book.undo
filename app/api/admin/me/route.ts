import { NextRequest } from "next/server";
import {
  getAdminSession,
  requireAdmin,
  unauthorizedResponse,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  const session = getAdminSession(req)!;
  return Response.json({
    role: session.role,
    userName: session.userName,
    displayName: session.displayName,
    buId: session.buId,
  });
}
