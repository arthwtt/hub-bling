import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  encrypt,
  decrypt,
  passwordHash,
  verifyPassword,
  randomToken,
  sha256,
} from "../src/server/crypto";
import {
  parseBlingJson,
  exchangeToken,
  readBling,
} from "../src/server/bling-transport";
import { importRecord } from "../src/lib/import-record";
import { boundedForm } from "../src/server/form";

test("importação minimiza dados pessoais persistidos", () => {
  assert.deepEqual(
    importRecord("contacts", {
      id: "123",
      nome: "Teste",
      numeroDocumento: "private-document",
      email: "private-email",
      endereco: { rua: "private" },
    }),
    { id: "123", nome: "Teste" },
  );
});
test("formulário limita o corpo mesmo sem Content-Length", async () => {
  const request = new Request("https://example.com", {
    method: "POST",
    body: new URLSearchParams({ password: "a".repeat(5000) }),
  });
  await assert.rejects(() => boundedForm(request), {
    message: "form_too_large",
  });
});

test("tokens criptografados exigem a chave e a empresa corretas; adulteração falha", () => {
  const key = randomBytes(32).toString("base64");
  const token = "access-and-refresh-test";
  const encrypted = encrypt(token, key, "tenant-a");
  assert.equal(decrypt(encrypted, key, "tenant-a"), token);
  assert.notEqual(encrypt(token, key, "tenant-a"), encrypted);
  assert.ok(!encrypted.includes(token));
  assert.throws(() => decrypt(encrypted, key, "tenant-b"));
  assert.throws(() =>
    decrypt(encrypted, randomBytes(32).toString("base64"), "tenant-a"),
  );
  const parts = encrypted.split(".");
  parts[2] = randomBytes(16).toString("base64url");
  assert.throws(() => decrypt(parts.join("."), key, "tenant-a"));
});
test("senha da central tem salt e validação; tokens de sessão são aleatórios", () => {
  const hash = passwordHash("test-password");
  assert.equal(verifyPassword("test-password", hash), true);
  assert.equal(verifyPassword("wrong", hash), false);
  assert.equal(verifyPassword("test-password", "bad"), false);
  assert.notEqual(hash, passwordHash("test-password"));
  assert.match(randomToken(), /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(sha256(randomToken()), sha256(randomToken()));
});
test("JSON preserva IDs de 44 dígitos e valores decimais antes de converter", () => {
  assert.deepEqual(
    parseBlingJson(
      '{"id":12345678901234567890123456789012345678901234,"saldo":1234.56}',
    ),
    { id: "12345678901234567890123456789012345678901234", saldo: "1234.56" },
  );
});
test("OAuth envia credenciais somente ao endpoint oficial e exige JWT", async () => {
  let calls = 0;
  const fake: typeof fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://api.bling.com.br/Api/v3/oauth/token");
    assert.equal(options?.method, "POST");
    assert.equal(new Headers(options?.headers).get("enable-jwt"), "1");
    assert.equal(options?.redirect, "error");
    assert.equal(options?.body, "grant_type=authorization_code&code=test-code");
    return new Response(
      '{"access_token":"test-access","refresh_token":"test-refresh","expires_in":3600}',
    );
  };
  const result = await exchangeToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code: "test-code",
    }),
    { id: "test-id", secret: "test-secret" },
    fake,
  );
  assert.equal(result.expires_in, 3600);
  assert.equal(calls, 1);
});
test("erros OAuth não refletem o corpo do provedor nem repetem troca incerta", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      exchangeToken(
        new URLSearchParams(),
        { id: "id", secret: "secret" },
        async () => {
          calls++;
          throw new Error("secret-value");
        },
      ),
    { message: "token_exchange_uncertain" },
  );
  assert.equal(calls, 1);
  await assert.rejects(
    () =>
      exchangeToken(
        new URLSearchParams(),
        { id: "id", secret: "secret" },
        async () => new Response("secret-body", { status: 401 }),
      ),
    { message: "authorization_failed" },
  );
});
test("consultas são GET oficiais e rejeitam redirecionamento de caminho", async () => {
  const fake: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.bling.com.br/Api/v3/produtos?pagina=1");
    assert.equal(options?.method, undefined);
    assert.equal(
      new Headers(options?.headers).get("Authorization"),
      "Bearer token",
    );
    return new Response('{"data":[{"id":999999999999999999}]}');
  };
  assert.deepEqual(await readBling("/produtos?pagina=1", "token", fake), [
    { id: "999999999999999999" },
  ]);
  for (const path of ["//evil.com", "/../oauth/token", "/%2e%2e/oauth/token"])
    await assert.rejects(() => readBling(path, "token", fake), {
      message: "invalid_resource_path",
    });
});
