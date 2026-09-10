import { classifyCallback } from '@/lib/callback';

export const dynamic = 'force-dynamic';
export function GET(request: Request) {
  const result = classifyCallback(new URL(request.url).searchParams);
  // Destino relativo fixo. Não confia no Host e nunca reflete code/state/error.
  return new Response(null, { status: 303, headers: {
    Location: `/integracao/retorno?resultado=${result}`,
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  } });
}
