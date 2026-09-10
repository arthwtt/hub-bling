import { session } from "@/server/auth";
import { sameOrigin, liveMode } from "@/server/config";
import { kinds, syncBatch, type Kind } from "@/server/sync";
import { BlingError } from "@/server/bling-transport";
import { boundedForm } from "@/server/form";
export const maxDuration = 300;
export async function POST(request: Request) {
  if (!liveMode() || !sameOrigin(request))
    return Response.json({ error: "invalid_origin" }, { status: 403 });
  const user = await session();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  let form: URLSearchParams;
  try {
    form = await boundedForm(request, 1024);
  } catch {
    return new Response(null, { status: 400 });
  }
  const kind = String(form.get("kind")) as Kind;
  if (!kinds.includes(kind))
    return Response.json({ error: "invalid_kind" }, { status: 400 });
  let result = "synced";
  try {
    await syncBatch(user.ownerId, kind, form.get("restart") === "1");
  } catch (error) {
    result = error instanceof BlingError ? error.category : "sync_failed";
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/configuracoes?integracao=${encodeURIComponent(result)}`,
      "Cache-Control": "no-store",
    },
  });
}
