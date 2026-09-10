import { readFileSync, appendFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { randomBytes, scryptSync } from "node:crypto";
const env = parseEnv(readFileSync(".env", "utf8"));
const additions = {};
if (!env.HUB_ADMIN_EMAIL) additions.HUB_ADMIN_EMAIL = env.BLING_EMAIL;
if (!env.HUB_ADMIN_PASSWORD_HASH) {
  const password = randomBytes(24).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  additions.HUB_ADMIN_PASSWORD = password; // Somente local; nunca enviar esta variável à Vercel.
  additions.HUB_ADMIN_PASSWORD_HASH = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
if (!env.TOKEN_ENCRYPTION_KEY)
  additions.TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
if (!env.APP_URL) additions.APP_URL = "https://hub-bling.vercel.app";
for (const [key, value] of Object.entries(additions)) {
  if (!value) throw new Error(`missing_${key}`);
  appendFileSync(".env", `\n${key}=${JSON.stringify(value)}\n`);
}
console.log("Configuração local preparada; valores secretos não exibidos.");
