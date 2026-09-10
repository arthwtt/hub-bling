"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  Users,
  Settings,
  ArrowUpRight,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Unplug,
  Copy,
  Check,
  FlaskConical,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";
import {
  channels,
  demoData,
  DEMO_START,
  DEMO_TODAY,
  shiftDate,
  type Order,
} from "@/lib/demo";
import {
  dateLabel,
  money,
  summarize,
  summarizeBills,
  toCsv,
  type Filters,
} from "@/lib/metrics";
import type { Section } from "@/lib/navigation";

const navigation = [
  {
    id: "visao-geral",
    label: "Visão geral",
    icon: LayoutDashboard,
    description: "Um resumo da sua operação, em um só lugar.",
  },
  {
    id: "vendas",
    label: "Vendas",
    icon: ShoppingBag,
    description: "Acompanhe os pedidos e o desempenho de cada canal.",
  },
  {
    id: "produtos",
    label: "Produtos e estoque",
    icon: Package,
    description: "Entenda o que vende e acompanhe a disponibilidade.",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    description: "Visualize títulos, vencimentos e valores em aberto.",
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: Users,
    description: "Conheça quem compra e quem volta a comprar.",
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    description: "Conexão com o Bling e preparação da sua central.",
  },
] as const;

function Badge({
  children,
  neutral = false,
}: {
  children: React.ReactNode;
  neutral?: boolean;
}) {
  return (
    <span className={`badge ${neutral ? "neutral" : ""}`}>{children}</span>
  );
}
function Stat({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Package;
}) {
  return (
    <article className="stat">
      <div className="stat-label">
        {label}
        <Icon size={17} aria-hidden />
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}
function Empty({
  text = "Não há dados demonstrativos para estes filtros.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Search size={26} aria-hidden />
      <h3>Nenhum resultado</h3>
      <p>{text}</p>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Hub({ section }: { section: Section }) {
  const current = navigation.find((item) => item.id === section)!;
  const isFinance = section === "financeiro";
  const [filters, setFilters] = useState<Filters>({
    start: shiftDate(DEMO_TODAY, -29),
    end: isFinance ? shiftDate(DEMO_TODAY, 30) : DEMO_TODAY,
    channel: "Todos",
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [toast, setToast] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState("");
  const orderDialog = useRef<HTMLDialogElement>(null);
  const glossaryDialog = useRef<HTMLDialogElement>(null);
  const validDates = Boolean(
    filters.start &&
    filters.end &&
    filters.start <= filters.end &&
    (Date.parse(filters.end) - Date.parse(filters.start)) / 86400000 <= 365,
  );
  const metrics = useMemo(
    () =>
      summarize(
        demoData,
        validDates
          ? filters
          : { ...filters, start: "9999-01-01", end: "0001-01-01" },
      ),
    [filters, validDates],
  );
  const finance = useMemo(
    () =>
      summarizeBills(
        demoData,
        validDates ? filters.start : "9999-01-01",
        validDates ? filters.end : "0001-01-01",
      ),
    [filters.start, filters.end, validDates],
  );
  const query = search.toLocaleLowerCase("pt-BR");
  const customerName = (id: string) =>
    demoData.customers.find((customer) => customer.id === id)?.name ??
    "Sem identificação";
  const sales = metrics.all
    .filter(
      (order) =>
        `${order.id} ${customerName(order.customerId)}`
          .toLocaleLowerCase("pt-BR")
          .includes(query) &&
        (status === "Todos" || order.status === status),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const products = metrics.products.filter((product) =>
    `${product.name} ${product.sku} ${product.category}`
      .toLocaleLowerCase("pt-BR")
      .includes(query),
  );
  const customers = metrics.customers.filter((customer) =>
    `${customer.name} ${customer.city} ${customer.state}`
      .toLocaleLowerCase("pt-BR")
      .includes(query),
  );
  const bills = finance.bills
    .filter(
      (bill) =>
        `${bill.id} ${bill.name}`.toLocaleLowerCase("pt-BR").includes(query) &&
        (status === "Todos" || bill.kind === status),
    )
    .sort((a, b) => a.due.localeCompare(b.due));
  const rowCount = isFinance ? bills.length : sales.length;
  const lastPage = Math.max(0, Math.ceil(rowCount / 12) - 1);
  const safePage = Math.min(page, lastPage);
  const setFilter = (update: Partial<Filters>) => {
    setFilters((previous) => ({ ...previous, ...update }));
    setPage(0);
  };
  function download() {
    let rows: (string | number)[][];
    if (section === "produtos")
      rows = [
        [
          "Origem",
          "SKU",
          "Produto",
          "Unidades no período",
          "Vendas BRL",
          "Saldo físico atual",
          "Reservado atual",
          "Disponível atual",
          "Classe ABC",
        ],
        ...products.map((p) => [
          "DEMONSTRAÇÃO",
          p.sku,
          p.name,
          p.quantity,
          (p.sales / 100).toFixed(2),
          p.physical,
          p.reserved,
          p.available,
          p.abc,
        ]),
      ];
    else if (section === "clientes")
      rows = [
        [
          "Origem",
          "Cliente",
          "Cidade",
          "UF",
          "Pedidos no período",
          "Vendas BRL",
          "Última compra no período",
        ],
        ...customers.map((c) => [
          "DEMONSTRAÇÃO",
          c.name,
          c.city,
          c.state,
          c.count,
          (c.total / 100).toFixed(2),
          c.last ?? "",
        ]),
      ];
    else if (isFinance)
      rows = [
        [
          "Origem",
          "Título",
          "Tipo",
          "Nome",
          "Vencimento",
          "Valor original BRL",
          "Saldo BRL",
          "Situação",
        ],
        ...bills.map((b) => [
          "DEMONSTRAÇÃO",
          b.id,
          b.kind,
          b.name,
          b.due,
          (b.value / 100).toFixed(2),
          (b.balance / 100).toFixed(2),
          b.status,
        ]),
      ];
    else
      rows = [
        [
          "Origem",
          "Pedido",
          "Data",
          "Cliente",
          "Canal",
          "Situação",
          "Total BRL",
        ],
        ...sales.map((o) => [
          "DEMONSTRAÇÃO",
          o.id,
          o.date,
          customerName(o.customerId),
          o.channel,
          o.status,
          (o.total / 100).toFixed(2),
        ]),
      ];
    const url = URL.createObjectURL(
      new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hub-bling-demo-${section}-${filters.start}-${filters.end}.csv`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("CSV demonstrativo exportado com os filtros da tabela.");
  }
  function showOrder(order: Order) {
    setSelected(order);
    orderDialog.current?.showModal();
  }
  async function copyCallback() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/api/integrations/bling/callback`,
      );
      setToast(
        "Endereço do callback copiado. Use o domínio de produção no cadastro do Bling.",
      );
    } catch {
      setToast(
        "Não foi possível copiar. O caminho do callback está indicado abaixo.",
      );
    }
  }
  async function testCallback() {
    setTesting(true);
    setTestResult("");
    try {
      const response = await fetch("/api/integrations/bling/callback", {
        cache: "no-store",
      });
      const result = new URL(response.url);
      if (
        !response.ok ||
        result.pathname !== "/integracao/retorno" ||
        result.searchParams.get("resultado") !== "missing_parameters"
      )
        throw new Error("unexpected");
      setTestResult(
        "Callback acessível: retorno controlado e URL limpa. A autorização OAuth real ainda não foi testada.",
      );
    } catch {
      setTestResult("Não foi possível validar o callback. Tente novamente.");
    } finally {
      setTesting(false);
    }
  }
  const toolbar = (
    <div className="table-toolbar">
      <label className="search-field">
        <Search size={16} aria-hidden />
        <input
          aria-label="Buscar na tabela"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder={
            section === "produtos"
              ? "Buscar produto ou SKU"
              : "Buscar na tabela"
          }
        />
      </label>
      {(section === "vendas" || isFinance) && (
        <select
          aria-label={isFinance ? "Tipo de título" : "Situação do pedido"}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }}
        >
          <option value="Todos">
            {isFinance ? "Todos os títulos" : "Todas as situações"}
          </option>
          {(isFinance
            ? ["receber", "pagar"]
            : ["Concluído", "Em andamento", "Cancelado"]
          ).map((s) => (
            <option key={s} value={s}>
              {s === "receber" ? "A receber" : s === "pagar" ? "A pagar" : s}
            </option>
          ))}
        </select>
      )}
    </div>
  );
  const pagination = (
    <div className="pagination">
      <span>
        {rowCount
          ? `${safePage * 12 + 1}–${Math.min((safePage + 1) * 12, rowCount)} de ${rowCount} registros`
          : "0 registros"}
      </span>
      <div>
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={safePage === 0}
          onClick={() => setPage(safePage - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        <span>
          Página {safePage + 1} de {lastPage + 1}
        </span>
        <button
          className="icon-button"
          aria-label="Próxima página"
          disabled={safePage === lastPage}
          onClick={() => setPage(safePage + 1)}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
  const ordersTable = (rows: Order[]) =>
    rows.length ? (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Canal</th>
              <th>Situação</th>
              <th className="numeric">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td>
                  <button
                    className="text-button"
                    onClick={() => showOrder(order)}
                  >
                    {order.id}
                  </button>
                </td>
                <td>{customerName(order.customerId)}</td>
                <td>{dateLabel(order.date)}</td>
                <td>{order.channel}</td>
                <td>
                  <span
                    className={`status ${order.status === "Cancelado" ? "canceled" : order.status === "Em andamento" ? "pending" : ""}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="numeric strong">{money(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty />
    );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <Link href="/visao-geral" className="brand">
          <span className="brand-mark">h</span>
          <span>
            hub<span className="brand-light">bling</span>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-avatar">LD</span>
          <div>
            <strong>Loja demonstração</strong>
            <small>Ambiente de exemplo</small>
          </div>
        </div>
        <p className="nav-caption">CENTRAL DE INFORMAÇÕES</p>
        <nav aria-label="Navegação principal">
          {navigation.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`/${id}`}
              onClick={() => setMobileOpen(false)}
              aria-current={section === id ? "page" : undefined}
              className={section === id ? "active" : ""}
            >
              <Icon size={18} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="connection-label">
            <span className="status-dot" />
            Bling não conectado
          </div>
          <p>Explore a central com dados fictícios.</p>
          <Link href="/configuracoes">
            Ver integração <ArrowRight size={14} />
          </Link>
        </div>
        <div className="sidebar-foot">
          Hub Bling <span>v0.1 · Demo</span>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Central</span>
            <ChevronRight size={14} aria-hidden />
            <strong>{current.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-indicator">
              <FlaskConical size={14} aria-hidden /> Demonstração
            </span>
            <button
              className="icon-button"
              aria-label="Entender as métricas"
              onClick={() => glossaryDialog.current?.showModal()}
            >
              <CircleHelp size={19} />
            </button>
            <span className="user-avatar" title="Loja demonstração">
              LD
            </span>
          </div>
        </header>
        <main id="conteudo">
          <div className="demo-banner">
            <FlaskConical size={17} aria-hidden />
            <span>
              <strong>Você está explorando uma demonstração.</strong> Todos os
              dados são fictícios. Referência: {dateLabel(DEMO_TODAY)}.
            </span>
            <Link href="/configuracoes">
              Sobre a conexão <ArrowRight size={14} />
            </Link>
          </div>
          <div className="page-heading">
            <div>
              <p className="eyebrow">SUA OPERAÇÃO, MAIS CLARA</p>
              <h1>{current.label}</h1>
              <p>{current.description}</p>
            </div>
            {section !== "configuracoes" && (
              <button
                className="button"
                onClick={download}
                disabled={!validDates}
              >
                <Download size={16} />
                Exportar CSV
              </button>
            )}
          </div>
          {section !== "configuracoes" && (
            <>
              <div className="filters">
                <div className="filter-dates">
                  <label>
                    {isFinance ? "Vencimento inicial" : "Data inicial"}
                    <input
                      type="date"
                      aria-label="Data inicial"
                      value={filters.start}
                      onChange={(event) =>
                        setFilter({ start: event.target.value })
                      }
                    />
                  </label>
                  <span className="date-separator">—</span>
                  <label>
                    {isFinance ? "Vencimento final" : "Data final"}
                    <input
                      type="date"
                      aria-label="Data final"
                      value={filters.end}
                      onChange={(event) =>
                        setFilter({ end: event.target.value })
                      }
                    />
                  </label>
                </div>
                {!isFinance && (
                  <label>
                    Canal de venda
                    <select
                      aria-label="Canal de venda"
                      value={filters.channel}
                      onChange={(event) =>
                        setFilter({
                          channel: event.target.value as Filters["channel"],
                        })
                      }
                    >
                      <option value="Todos">Todos os canais</option>
                      {channels.map((channel) => (
                        <option key={channel}>{channel}</option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="period-presets">
                  {[7, 30, 90].map((days) => (
                    <button
                      key={days}
                      className="preset"
                      onClick={() =>
                        setFilter({
                          start: shiftDate(DEMO_TODAY, 1 - days),
                          end: DEMO_TODAY,
                        })
                      }
                    >
                      {days} dias
                    </button>
                  ))}
                </div>
              </div>
              {!validDates && (
                <p className="validation" role="alert">
                  Selecione um período válido de até 366 dias, com a data
                  inicial anterior ou igual à final.
                </p>
              )}
              <p className="data-note">
                {isFinance
                  ? "Filtro por vencimento · saldo remanescente dos títulos · canal não se aplica"
                  : `Filtro pela data do pedido · cancelados fora dos indicadores · histórico fictício desde ${dateLabel(DEMO_START)}`}
              </p>
            </>
          )}

          {(section === "visao-geral" || section === "vendas") && (
            <div className="stats-grid">
              <Stat
                label="Valor vendido"
                value={money(metrics.revenue)}
                note="Pedidos não cancelados no período"
                icon={Wallet}
              />
              <Stat
                label="Pedidos válidos"
                value={String(metrics.eligible.length)}
                note={`${metrics.canceled} cancelados fora dos indicadores`}
                icon={ShoppingBag}
              />
              <Stat
                label="Ticket médio"
                value={metrics.ticket === null ? "—" : money(metrics.ticket)}
                note="Valor vendido ÷ pedidos válidos"
                icon={ArrowUpRight}
              />
              <Stat
                label="Itens vendidos"
                value={String(metrics.units)}
                note="Soma das unidades nos pedidos"
                icon={Package}
              />
            </div>
          )}

          {section === "visao-geral" && (
            <>
              <div className="overview-grid">
                <Panel
                  title="Evolução das vendas"
                  subtitle="Valor diário dos pedidos válidos"
                  action={<Badge neutral>Dados fictícios</Badge>}
                >
                  <div className="chart-total">
                    {money(metrics.revenue)}
                    <span>no período selecionado</span>
                  </div>
                  {metrics.eligible.length ? (
                    <div
                      className="chart"
                      role="img"
                      aria-label={`Vendas diárias no período: total ${money(metrics.revenue)}. Os pedidos podem ser consultados na tela Vendas.`}
                    >
                      <div className="chart-bars">
                        {metrics.daily.map((day) => (
                          <div
                            key={day.date}
                            className="bar-slot"
                            title={`${dateLabel(day.date)}: ${money(day.total)}`}
                          >
                            <div
                              className="bar"
                              style={{
                                height: `${(day.total / Math.max(1, ...metrics.daily.map((d) => d.total))) * 100}%`,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="chart-axis">
                        <span>{dateLabel(filters.start)}</span>
                        <span>{dateLabel(filters.end)}</span>
                      </div>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </Panel>
                <Panel
                  title="Vendas por canal"
                  subtitle="Participação no valor vendido"
                >
                  <div className="channel-list">
                    {channels.map((channel, index) => {
                      const total = metrics.eligible
                        .filter((o) => o.channel === channel)
                        .reduce((sum, o) => sum + o.total, 0);
                      const percent = metrics.revenue
                        ? (total / metrics.revenue) * 100
                        : 0;
                      return (
                        <div key={channel}>
                          <div className="channel-heading">
                            <span>
                              <i className={`channel-dot color-${index}`} />
                              {channel}
                            </span>
                            <strong>
                              {percent.toFixed(1).replace(".", ",")}%
                            </strong>
                          </div>
                          <div className="progress">
                            <span
                              className={`color-${index}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p>{money(total)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="panel-note">
                    A participação considera os mesmos filtros da visão geral.
                  </p>
                </Panel>
              </div>
              <div className="insight-strip">
                <div className="insight-icon">
                  <Package size={20} />
                </div>
                <div>
                  <strong>
                    {
                      metrics.products.filter(
                        (p) => p.coverage !== null && p.coverage < 15,
                      ).length
                    }{" "}
                    produtos com cobertura estimada abaixo de 15 dias
                  </strong>
                  <p>
                    Estimativa com saldo atual e consumo no período filtrado;
                    não é histórico de estoque.
                  </p>
                </div>
                <Link href="/produtos" className="text-button">
                  Ver produtos <ArrowRight size={15} />
                </Link>
              </div>
              <Panel
                title="Pedidos recentes"
                subtitle="Inclui cancelados para consulta; eles não compõem os indicadores"
                action={
                  <Link className="text-button" href="/vendas">
                    Ver todos <ArrowRight size={14} />
                  </Link>
                }
              >
                {ordersTable(sales.slice(0, 5))}
              </Panel>
            </>
          )}

          {section === "vendas" && (
            <Panel
              title="Todos os pedidos"
              subtitle="Clique no número para consultar os itens. A busca filtra a tabela e o CSV."
            >
              {toolbar}
              {ordersTable(sales.slice(safePage * 12, (safePage + 1) * 12))}
              {pagination}
            </Panel>
          )}

          {section === "produtos" && (
            <>
              <div className="stats-grid">
                <Stat
                  label="Produtos no catálogo"
                  value={String(demoData.products.length)}
                  note="Catálogo fictício completo"
                  icon={Package}
                />
                <Stat
                  label="Unidades vendidas"
                  value={String(metrics.units)}
                  note="Demanda do período filtrado"
                  icon={ShoppingBag}
                />
                <Stat
                  label="Unidades disponíveis"
                  value={String(
                    metrics.products.reduce((s, p) => s + p.available, 0),
                  )}
                  note={`Saldo atual em ${dateLabel(DEMO_TODAY)}`}
                  icon={Package}
                />
                <Stat
                  label="Cobertura abaixo de 15 dias"
                  value={String(
                    metrics.products.filter(
                      (p) => p.coverage !== null && p.coverage < 15,
                    ).length,
                  )}
                  note="Estimativa pelo consumo filtrado"
                  icon={ArrowUpRight}
                />
              </div>
              <Panel
                title="Desempenho e disponibilidade"
                subtitle="Vendas respeitam os filtros. Estoque é atual e não varia com o período."
              >
                {toolbar}
                {products.length ? (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Produto / SKU</th>
                          <th>Categoria</th>
                          <th className="numeric">Unidades vendidas</th>
                          <th className="numeric">Vendas</th>
                          <th>ABC</th>
                          <th className="numeric">Físico / reservado</th>
                          <th className="numeric">Disponível</th>
                          <th className="numeric">Cobertura estimada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <strong>{p.name}</strong>
                              <small>{p.sku}</small>
                            </td>
                            <td>{p.category}</td>
                            <td className="numeric">{p.quantity}</td>
                            <td className="numeric">{money(p.sales)}</td>
                            <td>
                              <Badge neutral={p.abc !== "A"}>{p.abc}</Badge>
                            </td>
                            <td className="numeric">
                              {p.physical} / {p.reserved}
                            </td>
                            <td className="numeric strong">{p.available}</td>
                            <td className="numeric">
                              <span
                                className={
                                  p.coverage !== null && p.coverage < 15
                                    ? "warning-text"
                                    : ""
                                }
                              >
                                {p.coverage === null
                                  ? "Sem consumo"
                                  : `${p.coverage.toFixed(1).replace(".", ",")} dias`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty />
                )}
                <p className="panel-note">
                  ABC por valor vendido, cortes acumulados de 80% e 95%.
                  Cobertura = disponível ÷ média diária vendida no período e
                  canal selecionados.
                </p>
              </Panel>
            </>
          )}

          {isFinance && (
            <>
              <div className="stats-grid">
                <Stat
                  label="A receber"
                  value={money(finance.receivable)}
                  note="Saldo dos títulos abertos e parciais"
                  icon={Wallet}
                />
                <Stat
                  label="A pagar"
                  value={money(finance.payable)}
                  note="Saldo dos títulos abertos e parciais"
                  icon={Wallet}
                />
                <Stat
                  label="Recebíveis vencidos"
                  value={money(finance.overdue)}
                  note={`Vencimento anterior a ${dateLabel(DEMO_TODAY)}`}
                  icon={ArrowUpRight}
                />
                <Stat
                  label="Diferença prevista"
                  value={money(finance.projected)}
                  note="A receber − a pagar; não é saldo bancário"
                  icon={Wallet}
                />
              </div>
              <Panel
                title="Títulos financeiros"
                subtitle="Filtros de busca e tipo afetam a tabela e o CSV; os indicadores resumem o período."
              >
                {toolbar}
                {bills.length ? (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Título / nome</th>
                          <th>Tipo</th>
                          <th>Vencimento</th>
                          <th>Situação</th>
                          <th className="numeric">Valor original</th>
                          <th className="numeric">Saldo restante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills
                          .slice(safePage * 12, (safePage + 1) * 12)
                          .map((b) => (
                            <tr key={b.id}>
                              <td>
                                <strong>{b.name}</strong>
                                <small>{b.id}</small>
                              </td>
                              <td>
                                <Badge neutral={b.kind === "pagar"}>
                                  {b.kind === "receber"
                                    ? "A receber"
                                    : "A pagar"}
                                </Badge>
                              </td>
                              <td>
                                {dateLabel(b.due)}
                                {b.due < DEMO_TODAY && b.balance > 0 && (
                                  <small className="warning-text">
                                    Vencido
                                  </small>
                                )}
                              </td>
                              <td>{b.status}</td>
                              <td className="numeric">{money(b.value)}</td>
                              <td className="numeric strong">
                                {money(b.balance)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty />
                )}
                {pagination}
              </Panel>
            </>
          )}

          {section === "clientes" && (
            <>
              <div className="stats-grid">
                <Stat
                  label="Clientes no período"
                  value={String(metrics.customers.length)}
                  note="Com pelo menos um pedido válido"
                  icon={Users}
                />
                <Stat
                  label="Clientes recorrentes"
                  value={String(
                    metrics.customers.filter((c) => c.count > 1).length,
                  )}
                  note="Duas ou mais compras dentro do período"
                  icon={Users}
                />
                <Stat
                  label="Receita do maior cliente"
                  value={money(metrics.customers[0]?.total ?? 0)}
                  note="Soma dos pedidos elegíveis"
                  icon={Wallet}
                />
                <Stat
                  label="Concentração no top 3"
                  value={
                    metrics.revenue
                      ? `${((metrics.customers.slice(0, 3).reduce((s, c) => s + c.total, 0) / metrics.revenue) * 100).toFixed(1).replace(".", ",")}%`
                      : "—"
                  }
                  note="Participação dos três maiores clientes"
                  icon={ArrowUpRight}
                />
              </div>
              <Panel
                title="Clientes por valor comprado"
                subtitle="Recorrência e última compra limitadas ao período selecionado."
              >
                {toolbar}
                {customers.length ? (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Cliente fictício</th>
                          <th>Localização</th>
                          <th className="numeric">Pedidos</th>
                          <th className="numeric">Valor comprado</th>
                          <th>Última compra no período</th>
                          <th>Perfil no período</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c.id}>
                            <td className="strong">{c.name}</td>
                            <td>
                              {c.city}, {c.state}
                            </td>
                            <td className="numeric">{c.count}</td>
                            <td className="numeric strong">{money(c.total)}</td>
                            <td>{c.last ? dateLabel(c.last) : "—"}</td>
                            <td>
                              <Badge neutral={c.count < 2}>
                                {c.count > 1 ? "Recorrente" : "Uma compra"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty />
                )}
              </Panel>
            </>
          )}

          {section === "configuracoes" && (
            <div className="settings-grid">
              <Panel
                title="Integração com o Bling"
                subtitle="Preparação para a conexão OAuth 2.0"
                action={<Badge neutral>Não conectado</Badge>}
              >
                <div className="integration-hero">
                  <span className="integration-icon">
                    <Unplug size={28} />
                  </span>
                  <h3>Sua central está em modo demonstração</h3>
                  <p>
                    A conexão real será habilitada após preparar login, banco de
                    dados e armazenamento seguro dos tokens.
                  </p>
                  <button className="button primary" disabled>
                    Conectar ao Bling · em preparação
                  </button>
                </div>
                <div className="callback-box">
                  <p className="eyebrow">URL DE RETORNO</p>
                  <code>/api/integrations/bling/callback</code>
                  <p>
                    O endereço copiado usa o domínio desta página. Cadastre o
                    domínio estável de produção no Bling.
                  </p>
                  <div className="button-row">
                    <button className="button" onClick={copyCallback}>
                      <Copy size={15} />
                      Copiar URL completa
                    </button>
                    <button
                      className="button"
                      onClick={testCallback}
                      disabled={testing}
                    >
                      {testing ? "Testando…" : "Testar callback"}
                    </button>
                  </div>
                  {testResult && (
                    <p role="status" className="test-result">
                      {testResult}
                    </p>
                  )}
                </div>
              </Panel>
              <Panel
                title="Etapas da integração"
                subtitle="Da publicação aos seus dados reais"
              >
                <ol className="steps">
                  <li>
                    <span className="step-circle done">
                      <Check size={14} />
                    </span>
                    <div>
                      <strong>Central demonstrativa</strong>
                      <p>Explore telas, filtros e indicadores com exemplos.</p>
                    </div>
                  </li>
                  <li>
                    <span className="step-circle">2</span>
                    <div>
                      <strong>Publicação e callback</strong>
                      <p>
                        Validar a URL de produção e cadastrá-la no aplicativo
                        Bling.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span className="step-circle">3</span>
                    <div>
                      <strong>Login e conexão segura</strong>
                      <p>
                        Preparar persistência e autorizar o acesso à sua
                        empresa.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span className="step-circle">4</span>
                    <div>
                      <strong>Importação gradual</strong>
                      <p>
                        Trazer os dados e conferir os números antes de ampliar
                        as métricas.
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="notice">
                  Nenhum dado real foi importado. Ter todos os escopos
                  disponíveis não significa que todos os campos estejam
                  preenchidos no Bling.
                </div>
              </Panel>
              <Panel
                title="O que os indicadores significam"
                subtitle="Regras explícitas desde o primeiro dia"
                className="full-width"
              >
                <div className="definitions">
                  <div>
                    <h3>Venda, faturamento e caixa</h3>
                    <p>
                      Pedidos válidos representam vendas. Notas fiscais e
                      recebimentos serão tratados separadamente, sem somar a
                      mesma receita duas vezes.
                    </p>
                  </div>
                  <div>
                    <h3>Margem e histórico</h3>
                    <p>
                      Custos atuais não comprovam lucro histórico. Indicadores
                      dependentes de dados adicionais serão identificados como
                      estimativas ou indisponíveis.
                    </p>
                  </div>
                  <div>
                    <h3>Atualização dos dados</h3>
                    <p>
                      A importação real terá status por módulo. Nesta versão, os
                      exemplos têm referência fixa em {dateLabel(DEMO_TODAY)}.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
          )}
          <footer className="main-footer">
            <span>Hub Bling · dados demonstrativos</span>
            <button
              className="text-button"
              onClick={() => glossaryDialog.current?.showModal()}
            >
              Como calculamos as métricas <CircleHelp size={14} />
            </button>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Fechar aviso"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <dialog ref={orderDialog} className="modal">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">PEDIDO DEMONSTRATIVO</p>
            <h2>{selected?.id}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Fechar detalhes"
            onClick={() => orderDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        {selected && (
          <>
            <p>
              {customerName(selected.customerId)} · {dateLabel(selected.date)} ·{" "}
              {selected.channel}
            </p>
            <Badge neutral={selected.status === "Cancelado"}>
              {selected.status}
            </Badge>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th className="numeric">Qtd.</th>
                    <th className="numeric">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, index) => (
                    <tr key={`${item.productId}-${index}`}>
                      <td>
                        {
                          demoData.products.find((p) => p.id === item.productId)
                            ?.name
                        }
                      </td>
                      <td className="numeric">{item.quantity}</td>
                      <td className="numeric">
                        {money(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="order-total">
              Total <strong>{money(selected.total)}</strong>
            </p>
            <p className="data-note">
              Exemplo sem frete ou descontos adicionais. Pedido cancelado fica
              fora dos indicadores.
            </p>
          </>
        )}
      </dialog>
      <dialog ref={glossaryDialog} className="modal">
        <div className="modal-heading">
          <h2>Como calculamos</h2>
          <button
            className="icon-button"
            aria-label="Fechar explicações"
            onClick={() => glossaryDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <dl className="glossary">
          <dt>Valor vendido</dt>
          <dd>
            Soma dos pedidos não cancelados pela data do pedido, incluindo os em
            andamento. Não equivale a recebimento.
          </dd>
          <dt>Ticket médio</dt>
          <dd>
            Valor vendido dividido pelo número de pedidos válidos. Sem pedidos,
            não há base de cálculo.
          </dd>
          <dt>Curva ABC</dt>
          <dd>
            Produtos ordenados por valor vendido. Classificação pela
            participação acumulada anterior ao produto, com cortes de 80% e 95%.
          </dd>
          <dt>Cobertura estimada</dt>
          <dd>
            Saldo disponível atual dividido pela média diária de unidades
            vendidas nos filtros escolhidos. Sem consumo, não é estimada.
          </dd>
          <dt>Financeiro</dt>
          <dd>
            Filtra vencimentos. Usa o saldo restante, descontando pagamentos
            parciais. Cancelados e liquidados não compõem valores em aberto.
          </dd>
          <dt>Recorrência</dt>
          <dd>
            Duas ou mais compras válidas dentro do período filtrado. Não
            representa o histórico completo do cliente.
          </dd>
        </dl>
        <div className="notice">
          Todos os números desta versão vêm de exemplos fictícios, com
          referência em {dateLabel(DEMO_TODAY)}.
        </div>
      </dialog>
    </div>
  );
}
