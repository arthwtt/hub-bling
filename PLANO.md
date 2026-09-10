# Hub Bling — plano de execução

Data: 10/09/2026. Situação: planejamento inicial; aplicação, repositório remoto, deploy e OAuth ainda não executados.

Atualização: frontend básico e substituível, tecnologias estáveis recentes. A análise detalhada de contratos, riscos, volume e critérios de liberação está em `ANALISE-API-RISCOS.md`; a varredura completa de leitura está em `API-AUDITORIA.md`. Esses documentos refinam as decisões abaixo. A tentativa de revisão pelo Claude foi impedida pelo limite de sessão, sem parecer produzido.

## Escopo e decisões

- Trabalhar exclusivamente em `C:\Users\arthw\OneDrive\Desktop\hub-bling`, sem worktrees ou cópias do projeto. Subdiretórios internos de código poderão ser criados quando necessários.
- Central de informações e dashboards em português, com extração do Bling e indicadores calculados pelo Hub.
- Primeira entrega com dados demonstrativos explicitamente identificados, sem chamadas à API de dados nem ao endpoint de tokens do Bling.
- GitHub e Vercel já autorizados pelo usuário como etapas seguintes. Preferência inicial: repositório privado `hub-bling`, sujeito à disponibilidade do nome.
- Considerar todos os escopos disponíveis, conforme informado; confirmar os efetivamente concedidos após o OAuth. Primeira integração voltada à leitura, sem operações de alteração no ERP.
- Arquitetura proposta: Next.js e TypeScript na Vercel; PostgreSQL para dados e conexões; processamento persistente em lotes para importações. Provedor do banco e executor de tarefas serão definidos antes da conexão real, conforme recursos disponíveis e custos.
- Dashboards consultarão o banco do Hub. Abrir uma tela não deve disparar uma importação completa do ERP.

## 1. Base e contrato dos dados

Criar aplicação na raiz atual, layout da central, filtros compartilhados, estados de carregamento/erro/sem dados e uma camada de dados substituível (demo e real).

Telas iniciais: visão geral, vendas, produtos/estoque, financeiro, clientes e configurações/conexão. Mostrar origem dos dados, período e última sincronização. A autenticação dos usuários do Hub é separada da autorização de acesso ao Bling.

Antes de exibir dados reais: login do Hub, associação usuário–empresa, controle de acesso em todas as consultas e isolamento entre empresas. Modelo mínimo: usuários, empresas, membros, conexões Bling, pedidos e itens, produtos, contatos, depósitos/saldos, títulos financeiros, execuções de sincronização e eventos recebidos.

Conclusão: aplicação local utilizável com dados demonstrativos e build validado; nenhum segredo no navegador, bundle ou Git.

## 2. GitHub e primeira publicação

1. Inicializar Git nesta pasta e conferir exclusão do `.env` antes de qualquer commit.
2. Criar repositório privado na conta autenticada, publicar o código e vincular o projeto Vercel ao GitHub.
3. Publicar aplicação demonstrativa e reservar `/api/integrations/bling/callback`.
4. Usar o domínio estável de produção, não a URL temporária de um deploy de preview.
5. Configurar variáveis exclusivamente de servidor no ambiente correto da Vercel. Preservar os nomes existentes `CLIENT_ID` e `CLIENT_SECRET`; acrescentar configuração de URL, sessão, banco e criptografia conforme a implementação. Não versionar os valores de `INVITE_LINK` nem dos demais segredos.
6. Testar HTTPS, página inicial, rota de saúde e callback em produção.

O callback previsto será `https://<dominio-confirmado>/api/integrations/bling/callback`. O domínio exato só poderá ser informado após a publicação.

Conclusão: URLs reais do GitHub, aplicação e callback documentadas; deploy saudável e callback acessível externamente.

## 3. Validar callback sem conectar ao Bling

Implementar e testar as condições de entrada usando fixtures e mock do endpoint de tokens, sem consumir a API real:

| Caso | Resultado esperado |
|---|---|
| Acesso direto sem parâmetros | Resposta controlada; nenhuma troca de tokens |
| Autorização negada | Mensagem clara; conexão não criada |
| `state` ausente, expirado ou divergente | Rejeição antes de qualquer chamada externa |
| Reutilização do mesmo `state` | Rejeição; tentativa de uso único |
| `code` ausente | Rejeição controlada |
| Sessão de outro usuário | Rejeição; nenhuma associação de empresa |
| Retorno válido simulado | Persistência e redirecionamento corretos usando mocks |

Uma resposta controlada 400 ao acesso direto pode ser correta: acessibilidade do callback não equivale a OAuth concluído. Endpoint não deve devolver tokens, códigos ou credenciais ao usuário ou logs. Remover parâmetros sensíveis da URL após processar o retorno.

## 4. Cadastro e OAuth real — somente após a publicação

Cadastrar no Bling a URL exata de produção. O cadastro determina redirecionamento e escopos; parâmetros enviados no link não substituem essa configuração. Em seguida, o usuário autoriza a conta pelo fluxo do Bling.

Fluxo: sessão autenticada no Hub → gerar `state` aleatório e temporário vinculado à sessão → autorização Bling → validar retorno → trocar código no servidor → salvar conexão da empresa → redirecionar para configurações.

A troca usa autenticação Basic com as credenciais do aplicativo e corpo form-urlencoded. O código dura um minuto. Armazenar tokens criptografados no banco; usar validade retornada e renovação com exclusão mútua por conexão, persistindo atomicamente os tokens retornados. Tratar revogação/expiração com reconexão, sem loops.

Fonte: https://developer.bling.com.br/aplicativos

Conclusão: conexão real autorizada e persistente, empresa identificada, renovação validada. A autorização depende da interação do titular no Bling; teste simulado não a substitui.

## 5. Importação e sincronização

Ordem sugerida: empresa/situações/canais/depósitos → produtos/contatos → pedidos e detalhes → saldos → contas a pagar/receber → documentos fiscais/compras conforme métricas.

Importação inicial proposta: últimos 90 dias, expansível. Confirmar volume após conexão e oferecer importação histórica em lotes. Cada módulo terá paginação, checkpoints e retomada; filtros de alteração só serão usados onde o endpoint os disponibilizar. Evitar requisição longa única na Vercel.

Limites documentados: 3 requisições/s e 120 mil/dia por conta, compartilhados entre módulos; filtros de período não devem ultrapassar um ano. Usar fila por empresa, margem para outros integradores, backoff com jitter e orçamento diário. Não repetir indiscriminadamente erros de validação ou autorização.

Fonte: https://developer.bling.com.br/limites

Paginação usa `pagina` e `limite`; conferir parâmetros e schema de cada rota. Listagem e detalhe não são necessariamente equivalentes. Guardar identificadores originais e datas, com upsert idempotente e valores monetários decimais.

Fonte: https://developer.bling.com.br/boas-praticas

Webhooks: validar assinatura sobre corpo bruto conforme contrato oficial, persistir/enfileirar antes de responder, deduplicar por empresa/eventId e tolerar eventos fora de ordem. Responder em até cinco segundos. Fazer reconciliação periódica e polling para módulos não cobertos. Estoque físico e virtual precisam de tratamento distinto.

Fonte: https://developer.bling.com.br/webhooks

Conclusão: reexecuções sem duplicação, importação retomável, limites respeitados e status de sincronização visível.

## 6. Módulos e indicadores

| Módulo | Recursos identificados na referência | Entrega prevista |
|---|---|---|
| Empresa | `/empresas/me/dados-basicos` | Identidade e vínculo da conexão |
| Vendas | `/pedidos/vendas`, detalhes, canais e situações | Valor vendido, pedidos, ticket médio, evolução e ranking |
| Produtos | `/produtos`, detalhes, categorias e fornecedores | Mix, curva ABC, dados de custo disponíveis |
| Estoque | `/estoques/saldos`, depósitos e produtos | Saldos físicos/virtuais e alertas de cobertura |
| Clientes | `/contatos`, pedidos | Recorrência, concentração de receita, segmentação RFM |
| Financeiro | `/contas/pagar`, `/contas/receber`, detalhes | Vencimentos, atrasos e projeção por títulos |
| Fiscal/compras | NF-e, NFC-e, NFS-e e pedidos de compra | Conciliação e enriquecimento em etapa posterior |

Definições propostas para validar com dados reais:

- Vendas: soma dos pedidos elegíveis por data do pedido, com regra explícita para cancelamentos; separar de faturamento fiscal e recebimento financeiro.
- Ticket médio: valor vendido dividido pelo número de pedidos elegíveis; período vazio retorna ausência de base, não divisão por zero.
- Curva ABC: participação acumulada no valor vendido por produto; inicialmente cortes de 80% e 95%, configuráveis.
- Cobertura: saldo disponível dividido pela média diária de unidades vendidas na janela; sem vendas, mostrar sem base de consumo.
- RFM: recência, frequência e valor por cliente identificado; excluir consumidor genérico quando não houver identidade confiável.
- Margem: depende de custo e despesas confiáveis. Custo atual não equivale a custo histórico. Marcar estimativas; não chamar margem estimada de lucro líquido.
- Estoque parado: saldo positivo e ausência de vendas na janela importada; não presumir histórico anterior à importação.
- Caixa projetado: entradas e saídas previstas por títulos; não equivale a saldo bancário conciliado.

Dados não disponíveis no Bling precisarão de cadastro complementar ou outra fonte: metas, custos históricos ausentes, mídia paga, comissões e despesas não registradas. Todos os escopos não garantem preenchimento desses dados.

## Levantamento realizado e pendências

O OpenAPI oficial foi obtido integralmente em `bling-openapi.json`; todas as operações foram catalogadas em `API-INVENTARIO.md`. Foram consultados os guias de aplicativos/OAuth, limites, boas práticas, erros e webhooks. O inventário inclui módulos além do MVP para orientar a expansão.

Isso não constitui teste de cada endpoint nem auditoria de cada schema: antes de implementar um módulo, revisar campos, filtros, respostas e permissões no snapshot e na referência atualizada. Nenhuma conta Bling foi acessada.

Ambiente: `.env` existente, Git/Node/npm/GitHub CLI/Claude Code disponíveis; GitHub autenticado como `arthwtt`. Acesso à Vercel e ao banco ainda não verificado.

Claude Code está autorizado como auxiliar. Quando houver implementação, delegar tarefas delimitadas (por exemplo, testes com mocks ou revisão de fórmulas), evitando escrita simultânea nos mesmos arquivos. Não repassar `.env` ou credenciais em prompts. A revisão e integração final continuam sob responsabilidade do agente principal; economia de tokens depende da tarefa e do custo do outro executor.

Próxima execução: construir a base demonstrativa, publicar GitHub/Vercel e entregar a URL real do callback com os testes de entrada concluídos. Só depois iniciar a conexão real.
