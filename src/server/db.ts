import "server-only";
import { Pool, type PoolClient } from "pg";
import { required } from "./config";

let pool: Pool | undefined;
export function db() {
  if (!pool) {
    const url = new URL(required("DATABASE_URL"));
    url.searchParams.set("sslmode", "verify-full");
    pool = new Pool({
      connectionString: url.toString(),
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 20000,
      lock_timeout: 15000,
      idle_in_transaction_session_timeout: 40000,
    });
  }
  return pool;
}
export async function transaction<T>(
  action: (client: PoolClient) => Promise<T>,
) {
  const client = await db().connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
