import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { updateBorrowViaManageToken } from "@/lib/borrow-manage";
import type { BorrowStatus } from "@/lib/types/borrow";

const ALLOWED: BorrowStatus[] = ["approved", "cancelled"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> },
) {
  try {
    await connectDB();
    const { token, id } = await params;
    const { status } = (await req.json()) as { status?: BorrowStatus };

    if (!status || !ALLOWED.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await updateBorrowViaManageToken(token, id, status);
    if (!result) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result);
  } catch {
    return Response.json({ error: "Failed to update request" }, { status: 400 });
  }
}
