// Guardar apenas os campos utilizados nesta versão; documentos, endereço e telefone não são importados.
export function importRecord(kind: string, source: Record<string, unknown>) {
  const fields: Record<string, string[]> = {
    orders: ["id", "numero", "data", "total", "totalProdutos"],
    products: ["id", "nome", "codigo", "preco", "situacao"],
    contacts: ["id", "nome", "codigo", "situacao"],
    receivables: [
      "id",
      "historico",
      "vencimento",
      "valor",
      "saldo",
      "situacao",
    ],
    payables: ["id", "historico", "vencimento", "valor", "saldo", "situacao"],
  };
  const result: Record<string, unknown> = {};
  for (const field of fields[kind] ?? []) {
    const value = source[field];
    if (typeof value === "string" || typeof value === "number")
      result[field] = value;
  }
  if (source.contato && typeof source.contato === "object") {
    const contact = source.contato as Record<string, unknown>;
    result.contato = { id: contact.id, nome: contact.nome };
  }
  if (
    kind === "orders" &&
    source.situacao &&
    typeof source.situacao === "object"
  ) {
    const status = source.situacao as Record<string, unknown>;
    result.situacao = { id: status.id, valor: status.valor };
  }
  return result;
}
