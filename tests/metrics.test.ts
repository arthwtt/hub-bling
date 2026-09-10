import { test } from "node:test";
import assert from "node:assert/strict";
import {
  demoData,
  DEMO_START,
  DEMO_TODAY,
  type DemoData,
} from "../src/lib/demo.ts";
import {
  summarize,
  summarizeBills,
  selectOrders,
  toCsv,
} from "../src/lib/metrics.ts";

const filters = {
  start: DEMO_START,
  end: DEMO_TODAY,
  channel: "Todos" as const,
};
test("cancelados aparecem na consulta, mas não em receita, unidades e clientes", () => {
  const base = demoData.orders[0];
  const data: DemoData = {
    ...demoData,
    orders: [
      { ...base, status: "Cancelado", total: 999999 },
      {
        ...base,
        id: "valid",
        status: "Concluído",
        total: 1000,
        items: [{ productId: "p1", quantity: 2, unitPrice: 500 }],
      },
    ],
  };
  const result = summarize(data, filters);
  assert.equal(result.all.length, 2);
  assert.equal(result.eligible.length, 1);
  assert.equal(result.revenue, 1000);
  assert.equal(result.units, 2);
  assert.equal(result.ticket, 1000);
  assert.equal(result.customers[0].count, 1);
});
test("limites de datas são inclusivos e canal é respeitado", () => {
  const order = demoData.orders[20];
  const rows = selectOrders(demoData.orders, {
    start: order.date,
    end: order.date,
    channel: order.channel,
  });
  assert.ok(rows.some((row) => row.id === order.id));
  assert.ok(
    rows.every(
      (row) => row.date === order.date && row.channel === order.channel,
    ),
  );
});
test("período vazio não inventa ticket ou cobertura", () => {
  const result = summarize(demoData, {
    ...filters,
    start: "2030-01-01",
    end: "2030-01-02",
  });
  assert.equal(result.revenue, 0);
  assert.equal(result.ticket, null);
  assert.ok(result.products.every((p) => p.coverage === null && p.abc === "—"));
});
test("receita reconcilia por dia, produto e cliente nos dados demo", () => {
  const result = summarize(demoData, filters);
  assert.equal(
    result.revenue,
    result.daily.reduce((sum, day) => sum + day.total, 0),
  );
  assert.equal(
    result.revenue,
    result.products.reduce((sum, p) => sum + p.sales, 0),
  );
  assert.equal(
    result.revenue,
    result.customers.reduce((sum, c) => sum + c.total, 0),
  );
});
test("financeiro soma saldo parcial e exclui liquidados/cancelados", () => {
  const bill = demoData.bills[0];
  const data: DemoData = {
    ...demoData,
    bills: [
      {
        ...bill,
        kind: "receber",
        due: "2026-09-09",
        value: 10000,
        balance: 2500,
        status: "Parcial",
      },
      {
        ...bill,
        kind: "receber",
        due: "2026-09-10",
        balance: 1000,
        status: "Aberto",
      },
      {
        ...bill,
        kind: "pagar",
        due: "2026-09-09",
        balance: 500,
        status: "Aberto",
      },
      { ...bill, due: "2026-09-09", balance: 8000, status: "Cancelado" },
      { ...bill, due: "2026-09-09", balance: 9000, status: "Liquidado" },
    ],
  };
  const result = summarizeBills(data, "2026-09-09", "2026-09-10");
  assert.equal(result.receivable, 3500);
  assert.equal(result.payable, 500);
  assert.equal(result.overdue, 2500);
  assert.equal(result.projected, 3000);
});
test("CSV protege campos de fórmula e preserva aspas/separadores", () => {
  const csv = toCsv([
    ["=CMD()", 'texto;"aspas"', 120],
    [" @SUM(A1)", "normal", 0],
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"\'=CMD()"'));
  assert.ok(csv.includes('"texto;""aspas"""'));
  assert.ok(csv.includes('"\' @SUM(A1)"'));
});
