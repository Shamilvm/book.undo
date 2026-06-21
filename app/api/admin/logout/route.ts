import { jsonClearSession } from "@/lib/auth";

export async function POST() {
  return jsonClearSession();
}
