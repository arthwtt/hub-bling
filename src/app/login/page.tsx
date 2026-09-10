import Link from "next/link";
import { isConfigured, liveMode } from "@/server/config";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const enabled = liveMode() && isConfigured();
  return (
    <main className="return-page">
      <div className="return-card">
        <span className="brand-mark">h</span>
        <p className="eyebrow">CENTRAL DE INFORMAÇÕES</p>
        <h1>Entrar no Hub Bling</h1>
        <p>
          Use o acesso da central. Sua senha do Bling é utilizada somente na
          página oficial do Bling.
        </p>
        {erro && (
          <div className="validation" role="alert">
            {erro === "limite"
              ? "Muitas tentativas. Aguarde 15 minutos para tentar novamente."
              : "E-mail ou senha inválidos."}
          </div>
        )}
        {enabled ? (
          <form action="/api/auth/login" method="post" className="login-form">
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
              />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={256}
              />
            </label>
            <button className="button primary">Entrar</button>
          </form>
        ) : (
          <div className="notice">
            O ambiente real ainda está sendo configurado.
          </div>
        )}
        <Link className="text-button" href="/demonstracao">
          Explorar dados demonstrativos
        </Link>
      </div>
    </main>
  );
}
