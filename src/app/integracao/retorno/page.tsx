import Link from 'next/link';
import { callbackMessages, type CallbackResult } from '@/lib/callback';

export default async function CallbackPage({ searchParams }: { searchParams: Promise<{ resultado?: string }> }) {
  const { resultado } = await searchParams;
  const key = resultado && Object.hasOwn(callbackMessages, resultado) ? resultado as CallbackResult : 'invalid_request';
  return <main className="return-page"><div className="return-card"><span className="brand-mark">h</span><p className="eyebrow">HUB BLING · DEMONSTRAÇÃO</p><h1>Retorno da integração</h1><p>{callbackMessages[key]}</p><div className="notice">Status: não conectado. Seus dados do Bling não foram consultados.</div><Link className="button primary" href="/configuracoes">Voltar às configurações</Link></div></main>;
}
