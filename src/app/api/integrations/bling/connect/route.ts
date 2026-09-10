export function POST() {
  return Response.json({ connected: false, mode: 'demo', error: 'integration_disabled', message: 'A conexão real será habilitada após preparar login, banco e armazenamento seguro de tokens.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
