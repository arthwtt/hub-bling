'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="return-page"><div className="return-card"><h1>Não foi possível abrir esta tela</h1><p>Tente carregar novamente.</p><button className="button primary" onClick={reset}>Tentar novamente</button></div></main>; }
