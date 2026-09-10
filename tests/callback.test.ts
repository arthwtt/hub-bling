import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCallback } from '../src/lib/callback.ts';
import { GET } from '../src/app/api/integrations/bling/callback/route.ts';
import { POST } from '../src/app/api/integrations/bling/connect/route.ts';

test('classifica retornos ausentes, negados, malformados e duplicados', () => {
  const cases = [['', 'missing_parameters'], ['error=access_denied', 'authorization_denied'], ['code=example', 'invalid_request'], ['state=example', 'invalid_request'], ['code=a&state=b&state=c', 'invalid_request'], ['code=%0A&state=a', 'invalid_request'], ['code=a&state=fake-or-expired', 'integration_disabled']];
  for (const [query, expected] of cases) assert.equal(classifyCallback(new URLSearchParams(query)), expected);
});
test('callback limpa code/state e não chama nenhum transporte externo', () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() => { throw new Error('Nenhuma chamada externa é permitida no callback demo'); }) as typeof fetch;
  try {
    for (const query of ['', '?code=private-code&state=private-state', '?error=private-error', '?code=a&code=b&state=c']) {
      const response = GET(new Request(`https://untrusted-host.example/api/integrations/bling/callback${query}`));
      assert.equal(response.status, 303);
      const location = response.headers.get('Location')!;
      assert.ok(location.startsWith('/integracao/retorno?resultado='));
      assert.ok(!location.includes('private')); assert.ok(!location.includes('untrusted-host'));
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
    }
  } finally { globalThis.fetch = original; }
});
test('iniciar conexão é bloqueado por código, não por presença de variável', async () => {
  const response = POST();
  assert.equal(response.status, 503);
  assert.deepEqual((await response.json()).connected, false);
});
