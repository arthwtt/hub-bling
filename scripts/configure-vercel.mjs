import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
const cli = process.argv[2];
if (!cli) throw new Error("Informe o caminho do CLI Vercel instalado.");
const env = parseEnv(readFileSync(".env", "utf8"));
const values = { APP_URL: "https://hub-bling.vercel.app", HUB_MODE: "live" };
for (const key of [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "HUB_ADMIN_EMAIL",
  "HUB_ADMIN_PASSWORD_HASH",
  "TOKEN_ENCRYPTION_KEY",
]) {
  if (!env[key]) throw new Error(`missing_${key}`);
  values[key] = env[key];
}
for (const [key, value] of Object.entries(values)) {
  const result = spawnSync(
    process.execPath,
    [
      cli,
      "env",
      "add",
      key,
      "production",
      "--force",
      "--yes",
      key === "APP_URL" || key === "HUB_MODE"
        ? "--no-sensitive"
        : "--sensitive",
    ],
    { input: value, encoding: "utf8", timeout: 60000 },
  );
  if (result.status !== 0) {
    console.error(
      `Não foi possível configurar ${key}; código ${result.status}.`,
    );
    process.exit(1);
  }
  console.log(`${key}: configurada em produção.`);
}
