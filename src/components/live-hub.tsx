import Link from "next/link";
import Decimal from "decimal.js";
import type { Section } from "@/lib/navigation";
import { sections } from "@/lib/navigation";
import { snapshot, kinds } from "@/server/sync";
import { appOrigin } from "@/server/config";

const labels: Record<Section, string> = {
  "visao-geral": "Visão geral",
  vendas: "Vendas",
  produtos: "Produtos",
  financeiro: "Financeiro",
  clientes: "Clientes",
  configuracoes: "Configurações",
};
const kindLabels = {
  orders: "Pedidos de venda",
  products: "Produtos",
  contacts: "Contatos",
  receivables: "Contas a receber",
  payables: "Contas a pagar",
};
const messages: Record<string, string> = {
  connected: "Bling conectado. Você já pode importar seus dados.",
  synced: "Lote importado. Continue até concluir a consulta.",
  invalid_state: "O link expirou ou já foi utilizado. Inicie uma nova conexão.",
  authorization_denied: "A autorização foi recusada no Bling.",
  reconnect_required: "Reconecte o Bling para continuar.",
  scope_denied:
    "O aplicativo não tem acesso a este recurso. Confira os escopos no Bling.",
  rate_limited:
    "O limite de consultas foi atingido. Aguarde antes de continuar.",
  sync_busy: "Já existe uma importação em andamento.",
  different_company: "Esta central já está vinculada a outra empresa.",
  token_exchange_uncertain:
    "Não foi possível confirmar a troca do token. Inicie uma nova conexão.",
};
function amount(value: unknown) {
  try {
    return new Decimal(String(value ?? "0"));
  } catch {
    return new Decimal(0);
  }
}
function money(value: Decimal) {
  return `R$ ${value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
function cell(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "—";
}
function nested(value: unknown, key: string) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

export async function LiveHub({
  section,
  ownerId,
  result,
}: {
  section: Section;
  ownerId: string;
  result?: string;
}) {
  const data = await snapshot(ownerId);
  const resources = data.resources as {
    kind: string;
    payload: Record<string, unknown>;
  }[];
  const filtered = (kind: string) =>
    resources.filter((r) => r.kind === kind).map((r) => r.payload);
  const orders = filtered("orders");
  const receivables = filtered("receivables");
  const payables = filtered("payables");
  const sum = (rows: Record<string, unknown>[], key: string) =>
    rows.reduce((total, r) => total.add(amount(r[key])), new Decimal(0));
  const list =
    section === "vendas"
      ? orders
      : section === "produtos"
        ? filtered("products")
        : section === "clientes"
          ? filtered("contacts")
          : section === "financeiro"
            ? [...receivables, ...payables]
            : [];
  return (
    <div className="live-shell">
      <header className="live-header">
        <Link href="/visao-geral">
          <strong>hub bling</strong>
        </Link>
        <span>{data.tenant?.name ?? "Central de informações"}</span>
        <form action="/api/auth/logout" method="post">
          <button className="button">Sair</button>
        </form>
      </header>
      <nav className="live-nav" aria-label="Principal">
        {sections.map((s) => (
          <Link
            key={s}
            href={`/${s}`}
            aria-current={s === section ? "page" : undefined}
          >
            {labels[s]}
          </Link>
        ))}
      </nav>
      <main className="live-main">
        <p className="eyebrow">DADOS REAIS · ACESSO PRIVADO</p>
        <h1>{labels[section]}</h1>
        {result && (
          <p className="notice" role="status">
            {messages[result] ??
              "Não foi possível concluir a operação. Confira a conexão e tente novamente."}
          </p>
        )}
        {!data.tenant ? (
          <section className="live-panel">
            <h2>Conecte sua empresa</h2>
            <p>
              Autorize o acesso pelo site oficial do Bling para começar. A
              central consulta informações sem alterar registros no ERP.
            </p>
            <form action="/api/integrations/bling/connect" method="post">
              <button className="button primary">Conectar com o Bling</button>
            </form>
          </section>
        ) : (
          <>
            <p className="notice">
              {data.tenant.status === "active"
                ? "Conexão ativa."
                : "A conexão precisa ser renovada."}{" "}
              A importação é feita em lotes. Os indicadores abaixo refletem
              somente os registros já importados e exibidos, com limite de 1.000
              registros na visão atual.
            </p>
            {section === "visao-geral" && (
              <>
                <div className="live-cards">
                  <article>
                    <small>Pedidos carregados nesta visão</small>
                    <strong>{orders.length}</strong>
                  </article>
                  <article>
                    <small>Valor bruto listado · todas as situações</small>
                    <strong>{money(sum(orders, "total"))}</strong>
                  </article>
                  <article>
                    <small>Saldo a receber · títulos carregados</small>
                    <strong>{money(sum(receivables, "saldo"))}</strong>
                  </article>
                  <article>
                    <small>Saldo a pagar · títulos carregados</small>
                    <strong>{money(sum(payables, "saldo"))}</strong>
                  </article>
                </div>
                <p>
                  O valor bruto inclui pedidos cancelados e em aberto; não
                  representa faturamento realizado. Os saldos financeiros vêm
                  dos detalhes dos títulos. Margem e lucro dependem de custos
                  históricos e conciliação, ainda não importados.
                </p>
              </>
            )}
            {section === "configuracoes" && (
              <section className="live-panel">
                <h2>Conexão e importação</h2>
                <p>Callback cadastrado no Bling:</p>
                <code>{appOrigin()}/api/integrations/bling/callback</code>
                <form action="/api/integrations/bling/connect" method="post">
                  <button className="button">Reconectar Bling</button>
                </form>
                <p>
                  Pedidos: últimos 30 dias pela data do pedido. Financeiro:
                  vencimentos dos últimos 30 dias, incluindo hoje. Produtos e
                  contatos: todos os cadastros. Cada clique importa até 10
                  registros; a próxima página fica salva.
                </p>
                {kinds.map((kind) => {
                  const job = data.jobs.find((j) => j.kind === kind);
                  return (
                    <div className="live-job" key={kind}>
                      <div>
                        <h3>{kindLabels[kind]}</h3>
                        <small>
                          {job
                            ? `${job.imported} importados · ${job.status === "complete" ? "Consulta concluída" : job.status === "error" ? "Falha, retome o lote" : "Importação parcial"} · ${job.date_start} a ${job.date_end}`
                            : "Ainda não importado"}
                        </small>
                        {job?.last_error && (
                          <small>
                            {messages[job.last_error] ??
                              "O lote falhou e pode ser retomado."}
                          </small>
                        )}
                      </div>
                      <form action="/api/integrations/bling/sync" method="post">
                        <input type="hidden" name="kind" value={kind} />
                        <button
                          className="button"
                          disabled={data.tenant?.status !== "active"}
                          name="restart"
                          value={job?.status === "complete" ? "1" : "0"}
                        >
                          {job?.status === "complete"
                            ? "Atualizar desde o início"
                            : job
                              ? "Continuar importação"
                              : "Importar primeiro lote"}
                        </button>
                      </form>
                    </div>
                  );
                })}
              </section>
            )}
            {["vendas", "produtos", "clientes", "financeiro"].includes(
              section,
            ) && (
              <section className="live-panel">
                <h2>Registros importados</h2>
                <p>
                  {list.length} registros nesta visão.{" "}
                  <Link className="text-button" href="/configuracoes">
                    Gerenciar importação
                  </Link>
                </p>
                {list.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>
                            {section === "vendas"
                              ? "Pedido / contato"
                              : section === "produtos"
                                ? "Produto"
                                : "Nome / histórico"}
                          </th>
                          <th>
                            {section === "financeiro"
                              ? "Vencimento"
                              : "Data / código"}
                          </th>
                          <th>
                            {section === "financeiro"
                              ? "Saldo"
                              : section === "clientes"
                                ? "Situação"
                                : "Valor"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((r, i) => (
                          <tr key={`${cell(r.id)}-${i}`}>
                            <td>{cell(r.id)}</td>
                            <td>
                              {cell(
                                r.nome ??
                                  nested(r.contato, "nome") ??
                                  r.historico ??
                                  r.numero,
                              )}
                            </td>
                            <td>{cell(r.vencimento ?? r.data ?? r.codigo)}</td>
                            <td>
                              {section === "clientes"
                                ? cell(r.situacao)
                                : money(amount(r.saldo ?? r.total ?? r.preco))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>
                    Nenhum dado importado. Inicie a consulta nas configurações.
                  </p>
                )}
              </section>
            )}
            <section className="live-panel">
              <h2>Cobertura da importação</h2>
              {data.jobs.length ? (
                data.jobs.map((j) => (
                  <p key={j.kind}>
                    {kindLabels[j.kind as keyof typeof kindLabels]}:{" "}
                    {j.imported} registros ·{" "}
                    {j.status === "complete" ? "concluído" : "parcial"} ·
                    atualizado em{" "}
                    {new Date(j.updated_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                ))
              ) : (
                <p>
                  O Bling está conectado. Importe os primeiros lotes nas
                  configurações.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
