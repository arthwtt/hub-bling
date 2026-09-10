import { cookies } from "next/headers";
import { session, SESSION_COOKIE } from "@/server/auth";
import { sameOrigin } from "@/server/config";
import { db } from "@/server/db";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const user = await session();
  if (user)
    await db().query("DELETE FROM hub_sessions WHERE session_hash=$1", [
      user.sessionHash,
    ]);
  (await cookies()).delete(SESSION_COOKIE);
  return new Response(null, {
    status: 303,
    headers: { Location: "/login", "Cache-Control": "no-store" },
  });
}
