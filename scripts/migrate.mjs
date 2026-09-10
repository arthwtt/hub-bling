import { readFileSync } from "node:fs";
import { Pool } from "pg";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não configurada");
const url = new URL(process.env.DATABASE_URL);
url.searchParams.set("sslmode", "verify-full");
const pool = new Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 15000,
  statement_timeout: 30000,
});
try {
  await pool.query(
    readFileSync(new URL("../migrations/001_hub.sql", import.meta.url), "utf8"),
  );
  console.log("Migração do Hub aplicada.");
} finally {
  await pool.end();
}
