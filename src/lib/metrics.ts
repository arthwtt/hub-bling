import { DEMO_TODAY, shiftDate, type DemoData, type Order, type Channel } from './demo.ts';

export type Filters = { start: string; end: string; channel: Channel | 'Todos' };
export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const dateLabel = (date: string) => date.split('-').reverse().join('/');
export function selectOrders(orders: Order[], filters: Filters) {
  return orders.filter(order => order.date >= filters.start && order.date <= filters.end && (filters.channel === 'Todos' || order.channel === filters.channel));
}
export function summarize(data: DemoData, filters: Filters) {
  const all = selectOrders(data.orders, filters);
  const eligible = all.filter(order => order.status !== 'Cancelado');
  const revenue = eligible.reduce((sum, order) => sum + order.total, 0);
  const units = eligible.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0), 0);
  const days = Math.max(1, Math.round((Date.parse(filters.end) - Date.parse(filters.start)) / 86400000) + 1);
  const ranking = data.products.map(product => {
    const items = eligible.flatMap(order => order.items).filter(item => item.productId === product.id);
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const sales = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const available = product.physical - product.reserved;
    return { ...product, quantity, sales, available, coverage: quantity > 0 ? available / (quantity / days) : null };
  }).sort((a, b) => b.sales - a.sales);
  let accumulated = 0;
  const products = ranking.map(product => {
    const abc = product.sales === 0 ? '—' : accumulated < .8 ? 'A' : accumulated < .95 ? 'B' : 'C';
    accumulated += revenue > 0 ? product.sales / revenue : 0;
    return { ...product, abc };
  });
  const customers = data.customers.map(customer => {
    const purchases = eligible.filter(order => order.customerId === customer.id);
    return { ...customer, count: purchases.length, total: purchases.reduce((sum, order) => sum + order.total, 0), last: purchases.map(order => order.date).sort().at(-1) ?? null };
  }).filter(customer => customer.count > 0).sort((a, b) => b.total - a.total);
  const daily = Array.from({ length: Math.min(days, 366) }, (_, i) => {
    const date = shiftDate(filters.start, i);
    return { date, total: eligible.filter(order => order.date === date).reduce((sum, order) => sum + order.total, 0) };
  });
  return { all, eligible, revenue, units, ticket: eligible.length ? Math.round(revenue / eligible.length) : null,
    products, customers, daily, canceled: all.length - eligible.length };
}
export function summarizeBills(data: DemoData, start: string, end: string) {
  // Financeiro filtra vencimento e usa saldo restante, nunca valor original de parcelas pagas.
  const bills = data.bills.filter(bill => bill.due >= start && bill.due <= end);
  const active = bills.filter(bill => bill.status !== 'Cancelado' && bill.status !== 'Liquidado');
  const receivable = active.filter(b => b.kind === 'receber').reduce((sum, b) => sum + b.balance, 0);
  const payable = active.filter(b => b.kind === 'pagar').reduce((sum, b) => sum + b.balance, 0);
  const overdue = active.filter(b => b.kind === 'receber' && b.due < DEMO_TODAY).reduce((sum, b) => sum + b.balance, 0);
  return { bills, receivable, payable, overdue, projected: receivable - payable };
}
export function toCsv(rows: (string | number)[][]) {
  // Mitiga fórmulas ao abrir campos textuais exportados em planilhas.
  return '\uFEFF' + rows.map(row => row.map(value => {
    const text = String(value);
    const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  }).join(';')).join('\r\n');
}
