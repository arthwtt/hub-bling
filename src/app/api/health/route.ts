export function GET() {
  return Response.json({ status: 'ok', application: 'hub-bling', version: '0.1.0', mode: 'demo', blingConnected: false }, { headers: { 'Cache-Control': 'no-store' } });
}
