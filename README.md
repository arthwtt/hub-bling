# Hub Bling

Central privada em português, construída com Next.js 16, React 19, TypeScript e PostgreSQL Neon. Trabalho realizado somente nesta pasta, sem worktrees.

## Acesso e configuração

Produção: https://hub-bling.vercel.app/login

Callback: https://hub-bling.vercel.app/api/integrations/bling/callback

GitHub privado: https://github.com/arthwtt/hub-bling

O login da central é separado do Bling. `scripts/setup-local.mjs` criou `HUB_ADMIN_EMAIL` e uma senha aleatória em `HUB_ADMIN_PASSWORD` no `.env` local. A Vercel recebe somente o hash scrypt dessa senha. `BLING_EMAIL`, `BLING_PASSWORD` e `HUB_ADMIN_PASSWORD` nunca são enviados à Vercel e não são usados pelo código da aplicação.

`HUB_MODE=live` habilita login e integração; sem esse valor as seções usam demonstração. `/demonstracao` continua público, com dados fictícios explicitamente identificados.

## Implementado

- Sessão de administrador único, armazenada como hash no PostgreSQL, expiração de 12 horas e cookie HttpOnly/Secure/SameSite=Lax.
- Limite de tentativas de login e validação da origem de operações POST.
- OAuth com state aleatório, associado à sessão, expiração de 10 minutos e consumo atômico de uso único.
- Callback com redirecionamento 303 para URL limpa, sem refletir código/token.
- Tokens cifrados com AES-256-GCM, vinculados à empresa por AAD; renovação coordenada por lock no banco.
- Consultas exclusivamente GET ao Bling, com JWT, timeout, controle de taxa e preservação de números grandes antes de parsear JSON.
- Importação manual em lotes de 10: pedidos, produtos, contatos, contas a receber e a pagar. Progresso persistido, lease por módulo e proteção contra reautorização concorrente.
- Financeiro consulta detalhes para obter saldo, sem substituir saldo pelo valor original.
- Telas reais mostram cobertura parcial e limites. Valor bruto de pedidos inclui todas as situações e não é apresentado como faturamento realizado.
- Persistência limitada aos campos exibidos; documentos, telefones, endereços e e-mails de contatos não são guardados.

## Estado da validação em 10/09/2026

Banco gratuito conectado e migração aplicada em produção. Build e testes automatizados passaram. Testes HTTP reais verificaram acesso privado, login, cookie seguro, origem externa recusada, state de uso único e logout. O login no site oficial do Bling funcionou.

**Pendente externo:** a tela de consentimento do Bling não oferece Autorizar porque o usuário não possui todos os recursos solicitados. Grupos sem permissão: Contratos, Controle de Lotes, Nota de Serviço e Ordens de Produção, incluindo suas operações de edição e exclusão. É necessário ajustar permissões/plano da conta ou retirar esses escopos do cadastro do aplicativo. Os quatro grupos não são consultados por esta versão.

Ainda não foi possível trocar um código real, validar a empresa, importar dados reais ou exercitar refresh com o Bling. Não tratar esses passos como concluídos.

## Executar e testar

Node.js 24. `npm ci`, `npm run dev`, abrir http://localhost:3000. A demonstração não precisa de banco.

- `npm test`: métricas demo, callback, criptografia, transporte OAuth, números grandes, minimização e limites de formulário.
- `npm run typecheck`: TypeScript.
- `npm run build`: build de produção; em Vercel Production + live aplica migração idempotente antes do build.
- `node scripts/verify-live.mjs`: testes contra produção, usando credenciais locais sem imprimir valores.
- `npm run audit:api`: análise offline do OpenAPI oficial salvo.

Para testar live localmente, usar banco de desenvolvimento válido e `APP_URL=http://localhost:3000`. Arquivos `.env.production.local` gerados por env pull podem conter `[SENSITIVE]`, que não são credenciais utilizáveis. Não usar placeholders como conexão. Nunca substituir a chave de criptografia de um banco conectado sem migrar os envelopes ou reconectar o Bling.

## Limites desta etapa

Administrador único e uma empresa por central. Acesso multiusuário, recuperação de senha, MFA, fila automática, webhooks, exportação real, custos históricos e lucro ainda não foram implementados. O limite diário interno de 50 mil chamadas deixa reserva para outras integrações, sem conhecer o consumo externo.

Pedidos e títulos usam janela fixa de 30 dias; títulos filtrados pelo vencimento, sem representar todo o passivo/ativo. Produtos e contatos consultam todos os cadastros. Paginação por número de página do provedor pode mudar durante importação; conclusão significa fim das páginas observadas, não snapshot transacional nem conciliação auditada. A visão carrega no máximo 1.000 registros no total e informa esse limite. Atualização completa reinicia a coleta do módulo; durante a coleta os dados são parciais.

O código não registra tokens nem query OAuth. Logs da infraestrutura podem registrar URLs de entrada; aplicar controles de acesso e retenção do provedor. Consultas financeiras reais e comportamento de rate limit/refresh ainda exigem validação após a autorização.

## Documentação

`ANALISE-API-RISCOS.md`, `API-INVENTARIO.md`, `API-AUDITORIA.md` e `bling-openapi.json` documentam a API. `PLANO.md` registra o plano original; `DECISOES.md` as decisões posteriores. `REVISAO-CLAUDE.md` contém o parecer documental inicial. A revisão posterior de código ficou em `artifacts/revisao-oauth-claude.txt`, ignorada no Git, e suas decisões estão resumidas em `DECISOES.md`.
