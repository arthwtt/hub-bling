import { session } from "@/server/auth";
import { isConfigured, liveMode, required, sameOrigin } from "@/server/config";
import { randomToken, sha256 } from "@/server/crypto";
import { db } from "@/server/db";

export async function POST(request: Request) {
  if (liveMode() && isConfigured()) {
    if (!sameOrigin(request))
      return Response.json({ error: "invalid_origin" }, { status: 403 });
    const user = await session();
    if (!user)
      return new Response(null, {
        status: 303,
        headers: { Location: "/login" },
      });
    const state = randomToken();
    await db().query(
      "INSERT INTO hub_oauth_states(state_hash,session_hash,owner_id,expires_at) VALUES($1,$2,$3,now()+interval '10 minutes')",
      [sha256(state), user.sessionHash, user.ownerId],
    );
    const url = new URL("https://bling.com.br/Api/v3/oauth/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", required("CLIENT_ID"));
    url.searchParams.set("state", state);
    return new Response(null, {
      status: 303,
      headers: {
        Location: url.toString(),
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  }
  return Response.json(
    {
      connected: false,
      mode: "demo",
      error: "integration_disabled",
      message:
        "A conexão real será habilitada após preparar login, banco e armazenamento seguro de tokens.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
