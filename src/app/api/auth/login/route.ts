import { db } from "@/server/db";
import { sameOrigin, required, liveMode, isConfigured } from "@/server/config";
import { ownerId, SESSION_COOKIE } from "@/server/auth";
import { randomToken, sha256, verifyPassword } from "@/server/crypto";
import { cookies } from "next/headers";
import { boundedForm } from "@/server/form";

export async function POST(request: Request) {
  if (!liveMode() || !isConfigured())
    return Response.json({ error: "not_configured" }, { status: 503 });
  if (!sameOrigin(request))
    return Response.json({ error: "invalid_origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096)
    return new Response(null, { status: 413 });
  let form: URLSearchParams;
  try {
    form = await boundedForm(request);
  } catch {
    return new Response(null, { status: 400 });
  }
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  // Limite global do único administrador do MVP; independe de headers IP falsificados.
  const rate = await db().query(
    "INSERT INTO hub_login_limits(key,attempts,resets_at) VALUES('owner',1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN hub_login_limits.resets_at<now() THEN 1 ELSE hub_login_limits.attempts+1 END,resets_at=CASE WHEN hub_login_limits.resets_at<now() THEN now()+interval '15 minutes' ELSE hub_login_limits.resets_at END RETURNING attempts",
  );
  if (rate.rows[0].attempts > 10)
    return new Response(null, {
      status: 303,
      headers: { Location: "/login?erro=limite", "Cache-Control": "no-store" },
    });
  const passwordOk = verifyPassword(
    password,
    required("HUB_ADMIN_PASSWORD_HASH"),
  );
  if (email !== required("HUB_ADMIN_EMAIL").trim().toLowerCase() || !passwordOk)
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/login?erro=credenciais",
        "Cache-Control": "no-store",
      },
    });
  const token = randomToken();
  await db().query("DELETE FROM hub_sessions WHERE expires_at<now()");
  await db().query(
    "INSERT INTO hub_sessions(session_hash,owner_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",
    [sha256(token), ownerId()],
  );
  await db().query("DELETE FROM hub_login_limits WHERE key='owner'");
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 43200,
  });
  return new Response(null, {
    status: 303,
    headers: { Location: "/configuracoes", "Cache-Control": "no-store" },
  });
}
