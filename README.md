# Hub Bling

Central de informações em português, com visão geral, vendas, produtos/estoque, financeiro, clientes e configurações.

## Entrega atual

Versão **demonstrativa**, com dados fictícios de 13/06/2026 a 10/09/2026. Inclui filtros, busca, paginação, detalhes de pedidos, CSV e teste de acessibilidade do callback. Nenhuma integração autenticada com o Bling, login de usuários ou banco de dados foi implementado nesta etapa.

## Executar

Node.js 24 LTS. Instalar com `npm ci`, iniciar com `npm run dev` e abrir http://localhost:3000.

- `npm test`: testes das regras de indicadores e bloqueio do callback.
- `npm run typecheck`: verificação TypeScript.
- `npm run build`: build de produção.
- `npm start`: servidor de produção local após build.
- `npm run audit:api`: análise offline do OpenAPI oficial salvo.

Versões efetivamente instaladas são registradas em `package-lock.json`. O app usa Next.js e React; não exige variáveis de ambiente para a demonstração.

## Integração em preparação

- `GET /api/health`: informa saúde e modo demonstrativo, sem credenciais.
- `GET /api/integrations/bling/callback`: classifica o retorno e redireciona com 303 para uma página limpa. Não troca tokens, não autentica state nem cria conexões.
- `POST /api/integrations/bling/connect`: retorna 503 e `integration_disabled`.

A conexão está bloqueada no código. Não existe variável que a habilite nesta versão. `CLIENT_ID` e `CLIENT_SECRET` do `.env` local estão reservados para a etapa seguinte e não são lidos pela aplicação. Não enviar essas credenciais à Vercel até implementar o fluxo seguro.

Um callback acessível **não equivale a OAuth validado**. Antes do fluxo real: banco, login, state persistido e de uso único, proteção entre empresas, tokens criptografados, renovação coordenada e revisão dos logs de infraestrutura. O código do aplicativo não registra queries; isso não garante que proxies/provedor não registrem a URL de entrada.

O callback retorna para um caminho relativo fixo, sem confiar no Host ou refletir parâmetros sensíveis. O botão de copiar mostra a origem atual: cadastrar no Bling somente o domínio estável da produção, nunca o preview.

## Regras da demonstração

Dinheiro fictício em centavos inteiros; unidades dos exemplos são inteiras. O adapter real deverá tratar quantidades fracionárias, precisão decimal e inteiros grandes antes de converter o corpo JSON.

Vendas usam data do pedido e excluem cancelados. Financeiro usa vencimento e saldo restante. Estoque é um snapshot atual, mesmo quando o período muda. Recorrência considera apenas o período filtrado. A busca e o seletor de situação/tipo filtram a tabela e o CSV; os cards continuam resumindo o período e canal.

## Documentação

- `ANALISE-API-RISCOS.md`: análise documental, riscos e critérios para dados reais.
- `REVISAO-CLAUDE.md`: parecer independente do Claude baseado no documento fornecido, sem acesso à conta.
- `DECISOES.md`: decisões adotadas após a revisão.
- `PLANO.md`: plano inicial, anterior à implementação.
- `API-INVENTARIO.md` / `API-AUDITORIA.md`: inventário e varredura estrutural.

Todo o trabalho é realizado nesta pasta, em um repositório único, sem worktrees.
