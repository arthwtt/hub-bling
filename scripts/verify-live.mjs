import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import assert from "node:assert/strict";
const env = parseEnv(readFileSync(".env", "utf8"));
const base = "https://hub-bling.vercel.app";
const report = [];
const request = (path, options = {}) =>
  fetch(base + path, { redirect: "manual", ...options });
const check = (name, fn) =>
  fn().then(() => {
    report.push({ name, passed: true });
    console.log(`OK ${name}`);
  });
let cookie;
await check("páginas reais exigem login", async () => {
  for (const page of [
    "visao-geral",
    "vendas",
    "produtos",
    "financeiro",
    "clientes",
    "configuracoes",
  ]) {
    const r = await request("/" + page);
    assert.equal(r.status, 307);
    assert.equal(r.headers.get("location"), "/login");
  }
});
await check("POST de origem externa é recusado", async () => {
  const r = await request("/api/auth/login", {
    method: "POST",
    headers: { Origin: "https://untrusted.example" },
    body: new URLSearchParams({ email: "test", password: "test" }),
  });
  assert.equal(r.status, 403);
});
await check("login válido cria sessão HttpOnly Secure SameSite", async () => {
  const r = await request("/api/auth/login", {
    method: "POST",
    headers: { Origin: base },
    body: new URLSearchParams({
      email: env.HUB_ADMIN_EMAIL,
      password: env.HUB_ADMIN_PASSWORD,
    }),
  });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get("location"), "/configuracoes");
  const setCookie = r.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /Secure/i);
  assert.match(setCookie, /SameSite=lax/i);
  cookie = setCookie.split(";")[0];
  const page = await request("/configuracoes", { headers: { Cookie: cookie } });
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("DADOS REAIS"));
});
await check("OAuth usa state persistente e de uso único", async () => {
  const r = await request("/api/integrations/bling/connect", {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
  });
  assert.equal(r.status, 303);
  const location = new URL(r.headers.get("location"));
  assert.equal(location.origin, "https://bling.com.br");
  const state = location.searchParams.get("state");
  assert.match(state, /^[A-Za-z0-9_-]{43}$/);
  const callback =
    "/api/integrations/bling/callback?" +
    new URLSearchParams({ error: "access_denied", state });
  const denied = await request(callback, { headers: { Cookie: cookie } });
  assert.equal(denied.status, 303);
  assert.equal(
    denied.headers.get("location"),
    "/configuracoes?integracao=authorization_denied",
  );
  assert.equal(denied.headers.get("referrer-policy"), "no-referrer");
  const replay = await request(callback, { headers: { Cookie: cookie } });
  assert.equal(
    replay.headers.get("location"),
    "/configuracoes?integracao=invalid_state",
  );
});
await check("logout invalida a sessão persistida", async () => {
  const r = await request("/api/auth/logout", {
    method: "POST",
    headers: { Origin: base, Cookie: cookie },
  });
  assert.equal(r.status, 303);
  const after = await request("/configuracoes", {
    headers: { Cookie: cookie },
  });
  assert.equal(after.status, 307);
});
writeFileSync(
  "artifacts/live-verification.json",
  JSON.stringify(
    { at: new Date().toISOString(), base, checks: report },
    null,
    2,
  ),
);
