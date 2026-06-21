import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import {
  checkAdminCredentials,
  jsonWithSession,
  type AdminSessionRole,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json()) as {
    username?: string;
    password?: string;
  };
  if (!username?.trim() || !password) {
    return Response.json(
      { error: "Username and password required" },
      { status: 400 },
    );
  }

  const normalizedUser = username.trim().toLowerCase();

  if (checkAdminCredentials(normalizedUser, password)) {
    return jsonWithSession({
      role: "super_admin",
      userName: normalizedUser,
      displayName: process.env.ADMIN_DISPLAY_NAME || "Super Admin",
    });
  }

  try {
    await connectDB();
    const user = await User.findOne({
      userName: normalizedUser,
      status: "active",
      role: { $in: ["admin", "super_admin"] },
    }).select("+passwordHash");

    if (
      user?.passwordHash &&
      (await verifyPassword(password, user.passwordHash))
    ) {
      return jsonWithSession({
        role: user.role as AdminSessionRole,
        userName: user.userName,
        displayName: user.displayName,
        buId: user.buId,
      });
    }
  } catch {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }

  return Response.json({ error: "Invalid credentials" }, { status: 401 });
}
