import Link from "next/link";
export default function NotFound() {
  return (
    <main className="return-page">
      <div className="return-card">
        <h1>Página não encontrada</h1>
        <p>Este endereço não faz parte da central.</p>
        <Link className="button primary" href="/visao-geral">
          Abrir visão geral
        </Link>
      </div>
    </main>
  );
}
