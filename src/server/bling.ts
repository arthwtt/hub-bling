import "server-only";
import { randomUUID } from "node:crypto";
import { db, transaction } from "./db";
import { required } from "./config";
import { decrypt, encrypt } from "./crypto";
import {
  exchangeToken,
  readBling,
  BlingError,
  type Tokens,
  object,
} from "./bling-transport";
import { reserveRequest } from "./rate-limit";
import type { Session } from "./auth";

export async function getTenant(ownerId: string) {
  const { rows } = await db().query(
    "SELECT t.id,t.name,t.bling_company_id,c.status,c.version,c.updated_at FROM hub_tenants t JOIN hub_connections c ON c.tenant_id=t.id WHERE t.owner_id=$1",
    [ownerId],
  );
  return rows[0] as
    | {
        id: string;
        name: string;
        bling_company_id: string;
        status: string;
        version: number;
        updated_at: Date;
      }
    | undefined;
}
export async function completeAuthorization(code: string, user: Session) {
  await reserveRequest("oauth", 3500);
  const tokens = await exchangeToken(
    new URLSearchParams({ grant_type: "authorization_code", code }),
    { id: required("CLIENT_ID"), secret: required("CLIENT_SECRET") },
  );
  const company = object(
    await readBling("/empresas/me/dados-basicos", tokens.access_token),
  );
  if (
    typeof company.id !== "string" ||
    !company.id ||
    typeof company.nome !== "string"
  )
    throw new BlingError(502, "invalid_company");
  await transaction(async (client) => {
    // Serializa reautorizações do mesmo proprietário, inclusive antes de existir tenant.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      user.ownerId,
    ]);
    const previous = await client.query(
      "SELECT id,bling_company_id FROM hub_tenants WHERE owner_id=$1 FOR UPDATE",
      [user.ownerId],
    );
    if (previous.rows[0] && previous.rows[0].bling_company_id !== company.id)
      throw new BlingError(409, "different_company");
    const tenantId = previous.rows[0]?.id ?? randomUUID();
    await client.query(
      "INSERT INTO hub_tenants(id,owner_id,bling_company_id,name) VALUES($1,$2,$3,$4) ON CONFLICT(owner_id) DO UPDATE SET name=EXCLUDED.name",
      [tenantId, user.ownerId, company.id, company.nome],
    );
    const envelope = encrypt(
      JSON.stringify(tokens),
      required("TOKEN_ENCRYPTION_KEY"),
      tenantId,
    );
    await client.query(
      "INSERT INTO hub_connections(tenant_id,token_envelope,expires_at,scopes) VALUES($1,$2,$3,$4) ON CONFLICT(tenant_id) DO UPDATE SET token_envelope=EXCLUDED.token_envelope,expires_at=EXCLUDED.expires_at,scopes=EXCLUDED.scopes,version=hub_connections.version+1,status='active',updated_at=now()",
      [
        tenantId,
        envelope,
        new Date(Date.now() + tokens.expires_in * 1000),
        tokens.scope,
      ],
    );
  });
}
async function accessToken(
  tenantId: string,
  expectedVersion: number,
  forceRefresh = false,
) {
  // A transação mantém o lock durante renovação; persistência ocorre antes do token ser usado.
  return transaction(async (client) => {
    const { rows } = await client.query(
      "SELECT * FROM hub_connections WHERE tenant_id=$1 FOR UPDATE",
      [tenantId],
    );
    const connection = rows[0];
    if (
      !connection ||
      connection.version !== expectedVersion ||
      connection.status !== "active"
    )
      throw new BlingError(401, "reconnect_required");
    let tokens = JSON.parse(
      decrypt(
        connection.token_envelope,
        required("TOKEN_ENCRYPTION_KEY"),
        tenantId,
      ),
    ) as Tokens;
    if (
      forceRefresh ||
      new Date(connection.expires_at).getTime() - Date.now() < 120000
    ) {
      // O refresh não muda a geração da conexão; reconexão do usuário muda.
      // Outra instância aguardando o lock verá a nova expiração.
      await reserveRequest("oauth", 3500, client);
      tokens = await exchangeToken(
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokens.refresh_token,
        }),
        { id: required("CLIENT_ID"), secret: required("CLIENT_SECRET") },
      );
      await client.query(
        "UPDATE hub_connections SET token_envelope=$2,expires_at=$3,scopes=$4,updated_at=now() WHERE tenant_id=$1",
        [
          tenantId,
          encrypt(
            JSON.stringify(tokens),
            required("TOKEN_ENCRYPTION_KEY"),
            tenantId,
          ),
          new Date(Date.now() + tokens.expires_in * 1000),
          tokens.scope,
        ],
      );
    }
    return tokens.access_token;
  });
}
export async function blingGet(
  tenantId: string,
  version: number,
  path: string,
) {
  await reserveRequest(`company:${tenantId}`);
  try {
    const token = await accessToken(tenantId, version);
    return await readBling(path, token);
  } catch (error) {
    if (
      error instanceof BlingError &&
      [
        "authorization_failed",
        "token_exchange_uncertain",
        "invalid_token_response",
        "reconnect_required",
      ].includes(error.category)
    ) {
      await db().query(
        "UPDATE hub_connections SET status='reconnect_required',updated_at=now() WHERE tenant_id=$1 AND version=$2",
        [tenantId, version],
      );
    }
    throw error;
  }
}
