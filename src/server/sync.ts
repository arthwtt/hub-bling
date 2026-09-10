import "server-only";
import { randomUUID } from "node:crypto";
import { db, transaction } from "./db";
import { blingGet, getTenant } from "./bling";
import { BlingError, object } from "./bling-transport";
import { importRecord } from "@/lib/import-record";

export const kinds = [
  "orders",
  "products",
  "contacts",
  "receivables",
  "payables",
] as const;
export type Kind = (typeof kinds)[number];
const endpoints: Record<Kind, string> = {
  orders: "/pedidos/vendas",
  products: "/produtos",
  contacts: "/contatos",
  receivables: "/contas/receber",
  payables: "/contas/pagar",
};
const day = (offset: number) =>
  new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

export async function syncBatch(ownerId: string, kind: Kind, restart: boolean) {
  const tenant = await getTenant(ownerId);
  if (!tenant || tenant.status !== "active")
    throw new BlingError(409, "reconnect_required");
  const lease = randomUUID();
  const job = await transaction(async (client) => {
    await client.query(
      "INSERT INTO hub_sync(tenant_id,kind,date_start,date_end,connection_version) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
      [tenant.id, kind, day(-29), day(0), tenant.version],
    );
    const { rows } = await client.query(
      "SELECT *,date_start::text,date_end::text FROM hub_sync WHERE tenant_id=$1 AND kind=$2 FOR UPDATE",
      [tenant.id, kind],
    );
    let row = rows[0];
    if (row.lease_until && new Date(row.lease_until).getTime() > Date.now())
      throw new BlingError(409, "sync_busy");
    if (restart || row.connection_version !== tenant.version) {
      await client.query(
        "DELETE FROM hub_resources WHERE tenant_id=$1 AND kind=$2",
        [tenant.id, kind],
      );
      await client.query(
        "UPDATE hub_sync SET page=1,imported=0,status='pending',date_start=$3,date_end=$4,connection_version=$5 WHERE tenant_id=$1 AND kind=$2",
        [tenant.id, kind, day(-29), day(0), tenant.version],
      );
      row = {
        ...row,
        page: 1,
        imported: 0,
        status: "pending",
        date_start: day(-29),
        date_end: day(0),
        connection_version: tenant.version,
      };
    }
    if (row.status === "complete") return null;
    await client.query(
      "UPDATE hub_sync SET lease_id=$3,lease_until=now()+interval '5 minutes',status='running',last_error=NULL WHERE tenant_id=$1 AND kind=$2",
      [tenant.id, kind, lease],
    );
    return row;
  });
  if (!job) return;
  try {
    // Pequenos lotes manuais: no máximo 10 detalhes por execução, retomáveis após falha.
    const query = new URLSearchParams({
      pagina: String(job.page),
      limite: "10",
    });
    if (kind === "products") query.set("criterio", "5");
    if (kind === "contacts") query.set("criterio", "1");
    if (kind === "orders" || kind === "receivables") {
      query.set("dataInicial", job.date_start);
      query.set("dataFinal", job.date_end);
      if (kind === "receivables") query.set("tipoFiltroData", "V");
    }
    if (kind === "payables") {
      query.set("dataVencimentoInicial", job.date_start);
      query.set("dataVencimentoFinal", job.date_end);
    }
    const list = await blingGet(
      tenant.id,
      tenant.version,
      `${endpoints[kind]}?${query}`,
    );
    if (!Array.isArray(list)) throw new BlingError(502, "invalid_response");
    const records: Record<string, unknown>[] = [];
    for (const value of list) {
      let record = object(value);
      if (typeof record.id !== "string" || !/^\d+$/.test(record.id))
        throw new BlingError(502, "invalid_response");
      if (kind === "receivables" || kind === "payables") {
        const id = record.id;
        record = object(
          await blingGet(tenant.id, tenant.version, `${endpoints[kind]}/${id}`),
        );
        if (
          record.id !== id ||
          typeof record.saldo !== "string" ||
          !/^-?\d+(\.\d+)?$/.test(record.saldo)
        )
          throw new BlingError(502, "invalid_response");
      }
      records.push(importRecord(kind, record));
    }
    await transaction(async (client) => {
      const current = await client.query(
        "SELECT version FROM hub_connections WHERE tenant_id=$1 FOR UPDATE",
        [tenant.id],
      );
      if (current.rows[0]?.version !== tenant.version)
        throw new BlingError(409, "connection_changed");
      const owned = await client.query(
        "SELECT lease_id FROM hub_sync WHERE tenant_id=$1 AND kind=$2 FOR UPDATE",
        [tenant.id, kind],
      );
      if (owned.rows[0]?.lease_id !== lease)
        throw new BlingError(409, "sync_busy");
      for (const record of records)
        await client.query(
          "INSERT INTO hub_resources(tenant_id,kind,resource_id,payload,connection_version) VALUES($1,$2,$3,$4,$5) ON CONFLICT(tenant_id,kind,resource_id) DO UPDATE SET payload=EXCLUDED.payload,connection_version=EXCLUDED.connection_version,collected_at=now()",
          [tenant.id, kind, record.id, JSON.stringify(record), tenant.version],
        );
      await client.query(
        "UPDATE hub_sync SET page=page+1,imported=(SELECT count(*) FROM hub_resources WHERE tenant_id=$1 AND kind=$2),status=$3,lease_id=NULL,lease_until=NULL,updated_at=now() WHERE tenant_id=$1 AND kind=$2",
        [tenant.id, kind, list.length < 10 ? "complete" : "partial"],
      );
    });
  } catch (error) {
    const category =
      error instanceof BlingError ? error.category : "sync_failed";
    await db().query(
      "UPDATE hub_sync SET status='error',last_error=$4,lease_id=NULL,lease_until=NULL,updated_at=now() WHERE tenant_id=$1 AND kind=$2 AND lease_id=$3",
      [tenant.id, kind, lease, category],
    );
    throw error;
  }
}

export async function snapshot(ownerId: string) {
  const tenant = await getTenant(ownerId);
  if (!tenant) return { tenant: null, jobs: [], resources: [] };
  const [jobs, resources] = await Promise.all([
    db().query(
      "SELECT kind,page,imported,status,date_start::text,date_end::text,last_error,updated_at FROM hub_sync WHERE tenant_id=$1 AND connection_version=$2 ORDER BY kind",
      [tenant.id, tenant.version],
    ),
    db().query(
      "SELECT kind,payload,collected_at FROM hub_resources WHERE tenant_id=$1 AND connection_version=$2 ORDER BY collected_at DESC,resource_id LIMIT 1000",
      [tenant.id, tenant.version],
    ),
  ]);
  return { tenant, jobs: jobs.rows, resources: resources.rows };
}
