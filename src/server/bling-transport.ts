import { parse } from "lossless-json";

export type JsonRecord = Record<string, unknown>;
export class BlingError extends Error {
  constructor(
    public status: number,
    public category: string,
  ) {
    super(category);
  }
}
export function parseBlingJson(raw: string): unknown {
  // Antes de JSON.parse: números do provedor são mantidos textuais, inclusive IDs grandes.
  return parse(raw, undefined, { parseNumber: (value) => value });
}
export function object(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new BlingError(502, "invalid_response");
  return value as JsonRecord;
}
export type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
};
export async function exchangeToken(
  params: URLSearchParams,
  credentials: { id: string; secret: string },
  transport: typeof fetch = fetch,
): Promise<Tokens> {
  let response: Response;
  try {
    response = await transport("https://api.bling.com.br/Api/v3/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "1.0",
        "enable-jwt": "1",
      },
      body: params.toString(),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new BlingError(502, "token_exchange_uncertain");
  }
  if (!response.ok)
    throw new BlingError(
      response.status,
      response.status === 429 ? "rate_limited" : "authorization_failed",
    );
  let body: JsonRecord;
  try {
    body = object(parseBlingJson(await response.text()));
  } catch {
    throw new BlingError(502, "invalid_token_response");
  }
  if (
    typeof body.access_token !== "string" ||
    typeof body.refresh_token !== "string" ||
    !Number.isFinite(Number(body.expires_in)) ||
    Number(body.expires_in) <= 0
  )
    throw new BlingError(502, "invalid_token_response");
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: Number(body.expires_in),
    scope: typeof body.scope === "string" ? body.scope : "",
  };
}
export async function readBling(
  path: string,
  token: string,
  transport: typeof fetch = fetch,
) {
  if (
    !/^\/[a-zA-Z0-9/_?=&%\[\].-]+$/.test(path) ||
    path.startsWith("//") ||
    path.includes("..") ||
    /%2e|%2f|%5c/i.test(path)
  )
    throw new BlingError(400, "invalid_resource_path");
  let response: Response;
  try {
    response = await transport(`https://api.bling.com.br/Api/v3${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "enable-jwt": "1",
        Accept: "application/json",
      },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new BlingError(502, "bling_unavailable");
  }
  if (!response.ok)
    throw new BlingError(
      response.status,
      response.status === 429
        ? "rate_limited"
        : response.status === 401
          ? "reconnect_required"
          : response.status === 403
            ? "scope_denied"
            : "bling_unavailable",
    );
  try {
    return object(parseBlingJson(await response.text())).data;
  } catch {
    throw new BlingError(502, "invalid_response");
  }
}
