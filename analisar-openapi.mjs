import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Análise offline da documentação pública. Não lê .env nem faz chamadas à API.
const raw = readFileSync(
  new URL("./bling-openapi.json", import.meta.url),
  "utf8",
);
const spec = JSON.parse(raw.replace(/^\uFEFF/, ""));
const resolve = (ref) =>
  ref
    .split("/")
    .slice(1)
    .reduce(
      (value, key) => value?.[key.replace(/~1/g, "/").replace(/~0/g, "~")],
      spec,
    );
const deref = (value) => (value?.$ref ? resolve(value.$ref) : value);
const methods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
]);
const operations = Object.entries(spec.paths).flatMap(([path, item]) =>
  Object.entries(item)
    .filter(([method]) => methods.has(method))
    .map(([method, op]) => ({
      path,
      method,
      op,
      parameters: [...(item.parameters ?? []), ...(op.parameters ?? [])].map(
        deref,
      ),
    })),
);
const issues = [];
function walk(value, path = "#") {
  if (!value || typeof value !== "object") return;
  if (value.$ref && value.$ref.startsWith("#/") && !resolve(value.$ref))
    issues.push(`Referência não resolvida: ${path} -> ${value.$ref}`);
  // Em esquemas simples, required sem propriedade correspondente é uma ambiguidade.
  if (
    value.properties &&
    Array.isArray(value.required) &&
    !value.allOf &&
    !value.oneOf
  )
    for (const key of value.required)
      if (!(key in value.properties))
        issues.push(`required sem propriedade local: ${path} -> ${key}`);
  for (const [key, child] of Object.entries(value))
    walk(child, `${path}/${key}`);
}
walk(spec);
for (const { path, method, parameters } of operations) {
  const seen = new Set();
  for (const p of parameters.filter(Boolean)) {
    const id = `${p.in}:${p.name}`;
    if (seen.has(id))
      issues.push(
        `Parâmetro duplicado: ${method.toUpperCase()} ${path} -> ${id}`,
      );
    seen.add(id);
  }
}
const esc = (v) =>
  String(v ?? "")
    .replace(/\|/g, "/")
    .replace(/\r?\n/g, " ");
const get = operations.filter(({ method }) => method === "get");
const report = [
  "# Auditoria estrutural do OpenAPI Bling",
  "",
  "Snapshot consultado em 10/09/2026. Gerado por `node analisar-openapi.mjs`.",
  "",
  "Fonte: https://developer.bling.com.br/referencia",
  "JSON público: https://developer.bling.com.br/build/assets/openapi-DKXp8d1e.json",
  "",
  `SHA-256 do arquivo local: \`${createHash("sha256").update(raw).digest("hex")}\`.`,
  "",
  `- Rotas: ${Object.keys(spec.paths).length}.`,
  `- Operações: ${operations.length}; GET: ${get.length}.`,
  `- Schemas: ${Object.keys(spec.components.schemas).length}.`,
  "",
  "A varredura abrange todas as operações e referências locais. Aponta ambiguidades estruturais; não é um validador completo de OpenAPI nem comprova o comportamento do servidor.",
  "",
  "## Cobertura das operações de leitura",
  "",
  "Ausência de filtro significa apenas que ele não está declarado no snapshot. Não enviar parâmetros presumidos.",
  "",
  "| GET | Módulo | Parâmetros declarados | Respostas declaradas |",
  "|---|---|---|---|",
  ...get.map(
    ({ path, op, parameters }) =>
      `| \`${path}\` | ${esc(op.tags?.join(", "))} | ${
        esc(
          parameters
            .map((p) => p?.name)
            .filter(Boolean)
            .join(", "),
        ) || "—"
      } | ${Object.keys(op.responses ?? {}).join(", ")} |`,
  ),
  "",
  "## Pontos estruturais para revisão",
  "",
  ...issues.map((issue) => `- ${issue}`),
  "",
  "Um schema com allOf pode complementar propriedades em outro componente. Os achados required acima precisam de revisão contextual antes de classificá-los como defeito.",
  "",
];
writeFileSync(
  new URL("./API-AUDITORIA.md", import.meta.url),
  report.join("\n"),
);
console.log(
  JSON.stringify({
    paths: Object.keys(spec.paths).length,
    operations: operations.length,
    get: get.length,
    schemas: Object.keys(spec.components.schemas).length,
    structuralFindings: issues.length,
  }),
);
