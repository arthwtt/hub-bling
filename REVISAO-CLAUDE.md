## Escopo desta revisão

Li apenas o documento. Não abri o repositório, o `bling-openapi.json` nem o `API-AUDITORIA.md`, não executei o script e não fiz nenhuma chamada ao Bling. Portanto não confirmo os números (162 rotas, 407 schemas, 25 pontos) nem os achados de schema — eles são premissas do plano, não fatos verificados aqui. A crítica abaixo é sobre coerência, sequenciamento e decisões executáveis nesta fase.

## Parecer

O documento é bom onde a maioria dos planos falha: separa fato documental de suposição, nomeia a incerteza e não promete lucro real nem tempo real. O problema é de faseamento. Ele descreve o estado final (lease distribuído, inbox/outbox, tombstones, rodízio histórico, cobertura por indicador) e o estado inicial no mesmo nível de detalhe, e as duas listas se contradizem no ponto mais sensível: publicar o callback agora exigindo garantias que só existem depois do banco. O deploy demo precisa de um recorte muito menor e de cinco decisões concretas.

## Seis ajustes prioritários

**1. Callback sem segredo nesta fase.** Publique a rota, mas ela não troca `code` por token: valida formato, valida `state`, responde erro controlado e encerra. Consequência prática — **não configure `BLING_CLIENT_SECRET` no ambiente Vercel ainda**. O único uso dele é a troca de token; sem segredo publicado não há segredo a vazar, e o critério "segredos excluídos" passa a ser verificável por ausência, não por inspeção. Teste o fluxo com redirect sintético (`GET /api/bling/callback?code=fake&state=...`), o que dispensa cadastrar o app no Bling agora.

**2. Corrigir a regra "nenhum segredo em query".** Por protocolo, o `code` chega na query — a regra do documento é violada pelo próprio desenho. Decisão: o callback responde `303` imediato para uma URL limpa, nunca registra a URL completa, e `code`/`state` entram numa lista de scrubbing aplicada a logs e a qualquer telemetria. Desative analytics/instrumentação nessa rota. Isso vale a partir do primeiro deploy, porque logs de deploy demo persistem.

**3. Domínio canônico fixo e `state` viável sem banco.** Cada preview da Vercel gera URL própria; o redirect URI precisa ser o domínio de produção fixo, com URL absoluta construída de constante, nunca do header `Host`. Sem Postgres nesta fase, o `state` vive em cookie assinado `HttpOnly`, `SameSite=Lax` (não `Strict` — retorno externo é navegação top-level GET), `Path` restrito à rota e TTL curto, apagado no consumo. Registre como débito explícito: cookie não é uso único confiável entre dispositivos/instâncias e migra para tabela antes da primeira conexão real.

**4. Adapter e fixtures agora — com uma correção técnica.** Este é o trabalho que converte a análise em código sem credencial nenhuma, e o documento subestima um detalhe: "parser que preserve inteiros grandes" não é implementável depois do `JSON.parse`, porque a precisão já se perdeu quando o valor chega ao adapter. A decisão precisa ser no corpo bruto da resposta (parser que preserve texto, ou acesso ao source text no reviver se a versão fixada oferecer). Junto disso: dinheiro e quantidade como decimal em string, `numeric` no Postgres, nunca float; parse não estrito que tolera campo `required` ausente (`valorLista`), enum fora da faixa (situações 6/7) e campo extra, preservando sempre o valor original.

**5. `DEMO_MODE` isolado e mutuamente exclusivo com conexão real.** "Dados claramente fictícios" é frouxo demais. Torne o modo demo uma flag de ambiente, com banner permanente, fixtures em módulo separado e — regra dura — um tenant nunca pode ter demo e conexão real ativas simultaneamente. Nenhum número de fixture pode aparecer sem rótulo de origem. O incidente que isso previne é dado demo virando KPI apresentado como real.

**6. Cortar a maquinaria de sincronização do escopo atual, preservando só o formato.** Lease, outbox, tombstones, rodízio e reconciliação não entram agora. O que precisa existir já, porque é caro mudar depois, é o desenho das colunas: `tenant_id`, `bling_company_id` **string**, `connection_version`, `updated_at`, `raw_payload`, e um identificador de versão da chave de criptografia dos tokens. Decida o gerenciamento da chave antes de escrever o primeiro token, não depois.

## Riscos abertos antes de dados reais

- **Client secret acumula duas funções.** Ele assina o HMAC dos webhooks e autentica a troca de token. Rotacioná-lo quebra os dois ao mesmo tempo; o procedimento de rotação precisa ser escrito antes de haver webhook em produção.
- **Rotação de refresh token não confirmada.** Se o servidor rotacionar, single-flight não basta: o novo refresh precisa ser persistido atomicamente antes de usar o access token novo, ou uma falha parcial derruba a conexão de forma irrecuperável.
- **Versões do stack não devem morar no documento.** Fixe no lockfile no momento da instalação e registre o resolvido no repositório; a versão de runtime é a configuração do projeto na Vercel, não o número citado aqui. Nada em beta (Queues) no demo.
- **Custo e limites permanecem não medidos**, e a fase demo não os exercita — o risco só aparece na primeira importação, não antes.
- **A tabela de volume é hipotética.** Ela não pode ser reaproveitada como estimativa em UI ou em conversa comercial.

## Critérios de saída do deploy demo

Build reproduzível com versões fixadas; ausência de `CLIENT_SECRET` no ambiente; callback respondendo erro controlado a `state` inválido, ausente e expirado; `code`/`state` ausentes dos logs após um teste de redirect sintético; banner de demo visível em todas as telas com número. Se os cinco passarem, publique — os critérios de dados reais realmente não bloqueiam esta etapa.
