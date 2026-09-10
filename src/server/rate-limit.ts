import "server-only";
import { transaction } from "./db";
import { BlingError } from "./bling-transport";
import type { PoolClient } from "pg";

export async function reserveRequest(
  bucket: string,
  intervalMs = 600,
  existingClient?: PoolClient,
) {
  const reserve = async (client: PoolClient) => {
    await client.query(
      "INSERT INTO hub_rate_limits(bucket) VALUES($1) ON CONFLICT DO NOTHING",
      [bucket],
    );
    const { rows } = await client.query(
      "SELECT next_at, daily_count, daily_date=CURRENT_DATE AS today FROM hub_rate_limits WHERE bucket=$1 FOR UPDATE",
      [bucket],
    );
    if (rows[0].today && rows[0].daily_count >= 50000)
      throw new BlingError(429, "daily_budget_reached");
    const next = Math.max(Date.now(), new Date(rows[0].next_at).getTime());
    if (next - Date.now() > 15000) throw new BlingError(429, "rate_limited");
    await client.query(
      "UPDATE hub_rate_limits SET next_at=$2, daily_count=CASE WHEN daily_date=CURRENT_DATE THEN daily_count+1 ELSE 1 END, daily_date=CURRENT_DATE WHERE bucket=$1",
      [bucket, new Date(next + intervalMs)],
    );
    return Math.max(0, next - Date.now());
  };
  const wait = existingClient
    ? await reserve(existingClient)
    : await transaction(reserve);
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
}
