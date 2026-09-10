import { liveMode } from "@/server/config";
export function GET() {
  return Response.json(
    {
      status: "ok",
      application: "hub-bling",
      version: "0.1.0",
      mode: liveMode() ? "live" : "demo",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
