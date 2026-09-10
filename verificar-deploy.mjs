import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const evidence = [];
for (const path of [
  "/visao-geral",
  "/vendas",
  "/produtos",
  "/financeiro",
  "/clientes",
  "/configuracoes",
]) {
  const response = await fetch(`${base}${path}`);
  const body = await response.text();
  assert.equal(response.status, 200, path);
  assert.ok(
    body.includes("Todos os dados são fictícios"),
    `Banner ausente em ${path}`,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  evidence.push({ path, status: response.status, demoBanner: true });
}
const health = await fetch(`${base}/api/health`).then((r) => r.json());
assert.equal(health.mode, "demo");
assert.equal(health.blingConnected, false);
evidence.push({ path: "/api/health", ...health });

const cases = [
  ["", "missing_parameters"],
  ["?error=access_denied", "authorization_denied"],
  ["?code=fixture-code", "invalid_request"],
  ["?code=fixture-code&state=fixture-state", "integration_disabled"],
  ["?code=fixture-code&state=fixture-state&state=duplicate", "invalid_request"],
];
for (const [query, expected] of cases) {
  const response = await fetch(
    `${base}/api/integrations/bling/callback${query}`,
    { redirect: "manual" },
  );
  assert.equal(response.status, 303);
  const location = response.headers.get("location");
  assert.equal(location, `/integracao/retorno?resultado=${expected}`);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  const page = await fetch(new URL(location, base));
  const body = await page.text();
  assert.equal(page.status, 200);
  assert.ok(!body.includes("fixture-code") && !body.includes("fixture-state"));
  evidence.push({
    path: "/api/integrations/bling/callback",
    scenario: expected,
    status: response.status,
    location,
    finalStatus: page.status,
  });
}
const blocked = await fetch(`${base}/api/integrations/bling/connect`, {
  method: "POST",
});
assert.equal(blocked.status, 503);
assert.equal((await blocked.json()).connected, false);
evidence.push({
  path: "/api/integrations/bling/connect",
  status: 503,
  connected: false,
});
const missing = await fetch(`${base}/.env`);
assert.equal(missing.status, 404);
evidence.push({ path: "/.env", status: 404 });
mkdirSync(new URL("./artifacts/", import.meta.url), { recursive: true });
const report = {
  base,
  verifiedAt: new Date().toISOString(),
  assertionsPassed: true,
  evidence,
};
writeFileSync(
  new URL("./artifacts/deploy-verification.json", import.meta.url),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
