import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import {
  forbiddenResponse,
  requireAdmin,
  requireSuperAdmin,
  unauthorizedResponse,
} from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { serializeAdminUser } from "@/lib/user-serialize";
import type { UserRole, UserUpdate } from "@/lib/types/user";

function roleNeedsPassword(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  try {
    await connectDB();
    const { id } = await params;
    const body = (await req.json()) as UserUpdate;
    const update: Record<string, unknown> = {};

    if (body.userName !== undefined) {
      const userName = body.userName.trim();
      if (!userName) {
        return Response.json({ error: "userName cannot be empty" }, { status: 400 });
      }
      update.userName = userName;
    }
    if (body.displayName !== undefined) {
      update.displayName = body.displayName.trim();
    }
    if (body.buId !== undefined) {
      update.buId = body.buId.trim() || undefined;
    }
    if (body.role !== undefined) update.role = body.role;
    if (body.status !== undefined) update.status = body.status;
    if (body.email !== undefined) update.email = body.email.trim();
    if (body.phone !== undefined) {
      update.phone = body.phone.trim() || undefined;
    }
    if (body.notes !== undefined) {
      update.notes = body.notes.trim() || undefined;
    }
    if (body.password?.trim()) {
      update.passwordHash = await hashPassword(body.password.trim());
    }

    if (body.role !== undefined && roleNeedsPassword(body.role) && !body.password?.trim()) {
      const existing = await User.findById(id).select("+passwordHash");
      if (!existing?.passwordHash) {
        return Response.json(
          { error: "Password is required when assigning an admin role" },
          { status: 400 },
        );
      }
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("+passwordHash");

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(serializeAdminUser(user));
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return Response.json({ error: "userName or email already exists" }, { status: 409 });
    }
    return Response.json({ error: "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) return unauthorizedResponse();
  if (!requireSuperAdmin(req)) return forbiddenResponse();
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
