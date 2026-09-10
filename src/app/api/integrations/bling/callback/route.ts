import { classifyCallback } from "@/lib/callback";
import { session } from "@/server/auth";
import { liveMode, isConfigured } from "@/server/config";
import { db } from "@/server/db";
import { sha256 } from "@/server/crypto";
import { completeAuthorization } from "@/server/bling";
import { BlingError } from "@/server/bling-transport";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const result = classifyCallback(params);
  if (liveMode()) {
    let outcome = "invalid_request";
    try {
      if (!isConfigured()) throw new BlingError(503, "not_configured");
      const user = await session();
      if (!user) throw new BlingError(401, "login_required");
      const state = params.get("state") ?? "";
      if (
        !/^[A-Za-z0-9_-]{43}$/.test(state) ||
        ["code", "state", "error"].some((key) => params.getAll(key).length > 1)
      )
        throw new BlingError(400, "invalid_state");
      const consumed = await db().query(
        "UPDATE hub_oauth_states SET consumed_at=now() WHERE state_hash=$1 AND session_hash=$2 AND owner_id=$3 AND consumed_at IS NULL AND expires_at>now() RETURNING state_hash",
        [sha256(state), user.sessionHash, user.ownerId],
      );
      if (!consumed.rowCount) throw new BlingError(400, "invalid_state");
      if (params.has("error")) outcome = "authorization_denied";
      else {
        const code = params.get("code");
        if (!code || code.length > 2048 || /[\s\x00-\x1f]/.test(code))
          throw new BlingError(400, "invalid_request");
        await completeAuthorization(code, user);
        outcome = "connected";
      }
    } catch (error) {
      // Apenas enum seguro no retorno. Não registrar erro bruto do OAuth nem a URL.
      outcome =
        error instanceof BlingError ? error.category : "connection_failed";
    }
    const allowed = new Set([
      "connected",
      "invalid_request",
      "invalid_state",
      "login_required",
      "not_configured",
      "authorization_denied",
      "authorization_failed",
      "different_company",
      "rate_limited",
      "token_exchange_uncertain",
    ]);
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/configuracoes?integracao=${allowed.has(outcome) ? outcome : "connection_failed"}`,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  }
  // Destino relativo fixo. Não confia no Host e nunca reflete code/state/error.
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/integracao/retorno?resultado=${result}`,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
