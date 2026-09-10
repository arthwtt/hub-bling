export const callbackMessages = {
  missing_parameters: "Callback disponível. Nenhuma autorização foi recebida.",
  authorization_denied:
    "A autorização não foi concluída. Nenhuma conexão foi criada.",
  invalid_request:
    "O retorno de autorização não é válido. Nenhuma conexão foi criada.",
  integration_disabled:
    "Callback recebido. A conexão real está desativada nesta versão demonstrativa; nenhum código foi trocado por tokens.",
} as const;
export type CallbackResult = keyof typeof callbackMessages;

export function classifyCallback(params: URLSearchParams): CallbackResult {
  if (["code", "state", "error"].some((key) => params.getAll(key).length > 1))
    return "invalid_request";
  if (params.has("error")) return "authorization_denied";
  if (!params.has("code") && !params.has("state")) return "missing_parameters";
  const code = params.get("code");
  const state = params.get("state");
  if (
    !code ||
    !state ||
    code.length > 2048 ||
    state.length > 512 ||
    /[\s\x00-\x1f]/.test(code + state)
  )
    return "invalid_request";
  // Não há sessão OAuth, emissão de state ou transporte Bling nesta fase.
  // Formato plausível NÃO significa state autenticado. Todos os retornos são bloqueados.
  return "integration_disabled";
}
