import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { serializeAdminUser } from "@/lib/user-serialize";
import type { UserInput, UserRole } from "@/lib/types/user";

function roleNeedsPassword(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const role = req.nextUrl.searchParams.get("role");
    const status = req.nextUrl.searchParams.get("status");
    const buId = req.nextUrl.searchParams.get("buId");
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (buId) filter.buId = buId;

    const users = await User.find(filter)
      .select("+passwordHash")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return Response.json(users.map((user) => serializeAdminUser(user)));
  } catch {
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const body = (await req.json()) as UserInput;
    if (!body.userName?.trim() || !body.displayName?.trim() || !body.email?.trim()) {
      return Response.json(
        { error: "userName, displayName, and email are required" },
        { status: 400 },
      );
    }

    const role = body.role ?? "default";
    if (roleNeedsPassword(role) && !body.password?.trim()) {
      return Response.json(
        { error: "Password is required for admin users" },
        { status: 400 },
      );
    }

    const passwordHash = body.password?.trim()
      ? await hashPassword(body.password.trim())
      : undefined;

    const user = await User.create({
      userName: body.userName.trim(),
      displayName: body.displayName.trim(),
      buId: body.buId?.trim() || undefined,
      role,
      status: body.status ?? "active",
      email: body.email.trim(),
      phone: body.phone?.trim() || undefined,
      notes: body.notes?.trim() || undefined,
      passwordHash,
    });

    return Response.json(serializeAdminUser(user, passwordHash), { status: 201 });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return Response.json(
        { error: "userName or email already exists" },
        { status: 409 },
      );
    }
    return Response.json({ error: "Failed to create user" }, { status: 400 });
  }
}
