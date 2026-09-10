import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { required } from "./config";
import { sha256 } from "./crypto";

export const SESSION_COOKIE = "hub_session";
export const ownerId = () =>
  sha256(required("HUB_ADMIN_EMAIL").trim().toLowerCase());
export type Session = { sessionHash: string; ownerId: string };
export async function session(): Promise<Session | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie || !/^[A-Za-z0-9_-]{43}$/.test(cookie)) return null;
  const sessionHash = sha256(cookie);
  const result = await db().query(
    "SELECT owner_id FROM hub_sessions WHERE session_hash=$1 AND expires_at>now()",
    [sessionHash],
  );
  if (result.rows[0]?.owner_id !== ownerId()) return null;
  return { sessionHash, ownerId: result.rows[0].owner_id };
}
