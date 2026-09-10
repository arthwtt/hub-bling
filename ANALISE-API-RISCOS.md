# Hub Bling — análise da API e riscos de implementação

10/09/2026 — análise documental e estrutural, sem chamadas autenticadas. Frontend básico e substituível, conforme orientação do usuário. Esta análise complementa e corrige o plano inicial onde houver maior detalhamento.

## Parecer

A central é viável, mas a principal dificuldade é manter uma base analítica coerente. A API expõe dados operacionais com contratos diferentes entre módulos; não entrega automaticamente um histórico analítico completo ou lucro real. Precisamos de sincronização por módulo, regras explícitas de indicadores e informação de cobertura dos dados.

Não há impedimento documental para começar uma aplicação demonstrativa e publicar o callback. Antes de dados reais, são necessários persistência, autenticação do Hub, isolamento de empresas, controle de tokens e processamento retomável. Nenhuma hipótese sobre a conta foi confirmada por uma chamada real.

## Evidência e alcance da análise

O snapshot público possui **162 rotas, 257 operações, 98 operações GET e 407 schemas**. A varredura offline percorreu todas as operações e referências locais, produziu a matriz completa de leitura e levantou 25 pontos estruturais para revisão. Nenhuma referência local não resolvida foi apontada pelo script. Os 25 pontos são ocorrências de campos required sem propriedade local correspondente; não significam 25 falhas comprovadas do servidor.

Foram revisados manualmente os filtros e schemas centrais de vendas, itens, produtos, fornecedores, estoque, contas a pagar/receber, contatos e empresa; filtros de compras e documentos fiscais; guias de OAuth, JWT, limites, webhooks, boas práticas e erros. Módulos periféricos estão inventariados, sem alegação de auditoria semântica integral de cada campo.

Evidência reproduzível: executar `node analisar-openapi.mjs`. Resultado em `API-AUDITORIA.md`; catálogo em `API-INVENTARIO.md`; snapshot em `bling-openapi.json`. O script não lê credenciais nem usa rede.

Fonte dos contratos: [referência oficial](https://developer.bling.com.br/referencia) e [OpenAPI público consultado](https://developer.bling.com.br/build/assets/openapi-DKXp8d1e.json). O nome versionado do arquivo pode mudar; atualizar pela referência oficial no início da implementação.

## Achados que mudam o projeto

| Evidência no contrato | Risco concreto | Decisão de implementação |
|---|---|---|
| Venda listada usa `VendasDadosBaseDTO`; detalhe agrega `VendasDadosDTO` | Ranking por itens ou vendedor incompleto se usar apenas listagem | Separar importação de cabeçalhos e enriquecimento; exibir completude |
| Produto lista `precoCusto` do fornecedor padrão | Buscar detalhe de todos os produtos sem necessidade; tratar custo atual como custo da venda | Aproveitar listagem; detalhe apenas para atributos necessários; margem histórica exige fonte temporal |
| `criterio` padrão de produtos é 1, contatos é 3, ambos “últimos incluídos” | Importação inicial incompleta por confiar no padrão | Produtos com critério 5; contatos com critério 1; confirmar exclusões em teste |
| Receber/pagar não declaram filtro por alteração | Títulos antigos quitados ou modificados não entram num incremental genérico | Reconsultar títulos em aberto/parciais, janelas recentes e reconciliação histórica escalonada |
| Receber tem datas padrão de emissão do último ano | Omissão de dívida antiga ou vencimento futuro | Definir explicitamente e separar janela de emissão, recebimento e vencimento |
| `saldo` financeiro aparece no detalhe, não na listagem básica | Somar valor original de título parcialmente pago superestima dívida | Enriquecer títulos e agregar saldo restante |
| Filtros financeiros documentam situações 1–5; DTOs retornam até 7 | Validador rejeita resposta legítima ou classifica situação errada | Preservar valor original; aceitar estado desconhecido e sinalizar; não enviar filtros 6/7 sem confirmação |
| NF-e omite canceladas quando situação não é enviada | Nota previamente importada continua compondo indicador após cancelamento | Consultar canceladas explicitamente e reconciliar registros existentes |
| `/estoques/saldos` não declara pagina/limite | Reutilizar paginador genérico e perder dados | Consulta por lotes de IDs; tamanho do lote ainda precisa de validação |
| Estoque possui saldo físico e virtual, total e por depósito | Somar total com depósitos ou confundir reserva com saída | Dimensões separadas; total não é uma linha adicional a agregar |
| Empresa possui ID string | Associar eventos à empresa errada por conversão/identidade improvisada | Usar ID oficial string, associado a tenant interno e conexão autorizada |
| Chave de acesso de NF-e é declarada integer com exemplo de 44 dígitos | Perda irreversível de precisão em Number | Identificadores/documentos como strings; parser que preserve inteiros grandes se vierem numéricos |
| `VendasItemDTO.required` inclui `valorLista`, ausente nas propriedades | Cliente gerado exige campo não definido | Tipos gerados são apoio; adapter de leitura validado com fixtures e respostas reais |
| Várias operações declaram apenas sucesso | Concluir equivocadamente que não ocorrem erros | Cliente com tratamento HTTP geral e erro seguro, independente do gerador |

O detalhe de vendas também contém descontos, transporte, tributos, comissões e taxas. Devemos avaliar esses campos antes de pedir fontes extras. Sua existência no schema não comprova preenchimento, semântica contábil ou cobertura de todos os custos da operação.

## Autorização e identidade

Não copiar a configuração OAuth do Swagger de forma automática: o snapshot inclui `OAuth2-Docs` com proxy do portal de documentação. O Hub usará endpoints de produção do guia de aplicativos: autorização em `https://bling.com.br/Api/v3/oauth/authorize` e tokens em `https://api.bling.com.br/Api/v3/oauth/token`.

O guia JWT exige `enable-jwt: 1` na emissão e renovação; também orienta o header nas chamadas autenticadas. A implementação seguirá essa orientação. Tokens podem ser maiores que 255 caracteres; armazenar conteúdo criptografado em campo sem esse limite. O guia ainda menciona transição de tokens opacos, portanto não assumir que o padrão já seja JWT. [Migração JWT](https://developer.bling.com.br/migracao-jwt).

Decisões de segurança do Hub:

- Um `state` aleatório, temporário e de uso único por tentativa, persistido e vinculado à sessão/empresa pretendida. Não reutilizar link fixo de convite como substituto.
- O callback público aceita retorno, mas só conclui vínculo com sessão válida e permissão para gerenciar integrações. Testar cookies em redirecionamento externo.
- Login do Hub não se confunde com token do Bling; decodificar um JWT não prova identidade nem autorização.
- Tokens renovados com lock distribuído/lease e versão da conexão. Um processo atrasado não pode sobrescrever tokens novos. Lock em memória não coordena instâncias Vercel.
- Reconexão, desconexão e revogação incrementam versão da conexão; trabalhos antigos deixam de operar.
- Falha ambígua após troca/renovação não deve causar repetição ilimitada. Recuperação pode exigir nova autorização; política de reutilização de refresh token precisa de confirmação real.
- Domínio de produção fixo, origem confiável configurada, sem construir redirect a partir de Host arbitrário. Nenhum segredo em query, logs, analytics, localStorage ou dados de página.

## Estratégia de sincronização

Cada módulo terá checkpoint próprio. Para recursos com alteração, capturar limite superior da janela, processar todas as páginas e detalhes necessários, só então avançar o checkpoint. Usar sobreposição configurável e upsert. Paginação por número não garante snapshot consistente quando a origem muda; reconciliação continua necessária.

Não acumular filtro de data de venda recente ao buscar alterações: isso poderia excluir pedido antigo alterado hoje. Não usar o maior ID como cursor de alteração. Campos não declarados no contrato não devem ser presumidos.

Financeiro terá três frentes: novas emissões, títulos abertos/parciais já conhecidos e revisão histórica em rodízio. Um título antigo cancelado ou reaberto pode exigir a terceira frente. A cobertura histórica incompleta precisa ser visível, inclusive para contas vencidas fora dos 90 dias iniciais de vendas.

Eventos sinalizam trabalho pendente; leitura posterior recupera estado atual quando disponível. Apagar linha ao receber um evento atrasado pode corromper o estado: registrar tombstones e tratar versões/ordem com reconciliação. Em exclusões sem recurso recuperável, manter trilha mínima de auditoria.

Webhooks usam `X-Bling-Signature-256` com prefixo `sha256=` e HMAC do corpo com o client secret. Comparação em tempo constante. Após até três dias de falhas, o recurso pode ser desabilitado e exigir reativação manual. Essa condição precisa aparecer na operação da central. [Webhooks oficiais](https://developer.bling.com.br/webhooks).

Persistir evento e trabalho pendente na mesma transação (inbox/outbox), ou garantir recuperação do evento persistido caso a publicação na fila falhe. ACK de evento duplicado é seguro apenas porque o trabalho original continua recuperável. Consumidor também deve ser idempotente.

## Volume, tempo e limites

Exemplo hipotético, não medição da conta: 10.000 pedidos e 5.000 produtos, páginas de 100.

| Estratégia | Requisições estimadas | Piso a 3 req/s | Planejamento a 2 req/s |
|---|---:|---:|---:|
| Listagens de ambos | 150 | 50 s | 75 s |
| Listagens + detalhe de todo pedido | 10.150 | 56 min 23 s | 84 min 35 s |
| Listagens + detalhe de todos os pedidos/produtos | 15.150 | 84 min 10 s | 126 min 15 s |

Conta aproximada: `ceil(pedidos/100) + ceil(produtos/100) + detalhes`. Não inclui consulta terminal vazia, financeiro, estoque, latência, retentativas ou outros integradores. Dois requests/s é uma proposta inicial, não reserva garantida: concorrência externa exige adaptação.

Além dos limites por conta do plano, existem bloqueios de IP; fan-out de renovações entre empresas pode atingi-los. Coordenar renovação e limitar também o tráfego de autenticação. [Limites oficiais](https://developer.bling.com.br/limites).

Conclusão operacional: importar por lotes curtos retomáveis, com prioridade para interação e atualizações recentes. Não prometer tempo real para todos os módulos nem concluir importação em uma única função HTTP.

## Dados e indicadores confiáveis

1. Pedidos, notas e títulos são fatos distintos. Nunca somá-los como se fossem três receitas. Conciliação usa vínculos documentados, e parcelas não duplicam venda.
2. Somar valor dos itens exige confirmar desconto percentual versus valor já líquido. O exemplo de `VendasItemDTO.valor` não justifica aplicar desconto uma segunda vez. Criar casos reais de conferência com o total do pedido.
3. Dinheiro e quantidades fracionárias usam decimal; divisão e arredondamento têm política explícita. Datas sem hora preservam a data de negócio; timestamps usam UTC internamente com timezone de exibição definido.
4. Curva ABC por produto precisa de itens importados; indicador agregado não prova completude dos itens. Kits, serviços, variações e produto pai exigem regras de agrupamento.
5. Saldo atual não reconstrói estoque passado. Cobertura pode usar demanda recente e saldo atual; giro histórico requer estoque médio confiável. Começar snapshots prospectivos; não inventar dias anteriores.
6. Lucro líquido, ROAS, CAC e LTV completo não são prometidos apenas com acesso a todos os escopos. Dados adicionais e regras são necessários. Mostrar valor conhecido, estimado ou indisponível.
7. Cada indicador registra definição/versão, período, fonte, última sincronização, cobertura e política de cancelamento. Conciliação com exemplos do Bling precede liberar métricas como confiáveis.

## Tecnologias e simplicidade

Proposta para implementação: **Next.js 16 na versão estável corrigida, TypeScript, React compatível e Node.js 24 LTS**, PostgreSQL e uma camada SQL com migrações. Verificar patches e compatibilidade no momento de instalar e fixar versões no lockfile. A publicação oficial consultada indica Next 16.3.3 como atualização de segurança da linha ativa; Node 24 consta como LTS. [Next.js](https://nextjs.org/blog), [Node.js](https://nodejs.org/en/about/previous-releases).

Frontend com navegação, tabelas, filtros e gráficos básicos, sem investir agora em design system ou estética definitiva. Regras de cálculo e integração ficam fora dos componentes visuais.

Um único aplicativo/repositório, organizado internamente por módulos. Sem microserviços ou warehouse separado no MVP. PostgreSQL atende persistência, agregação inicial, checkpoints e eventos; conexões com pool adequado a serverless. Cache precisa incluir empresa e permissões para não misturar usuários.

Para execução durável, avaliar Vercel Workflows/Queues na etapa de integração; a documentação atual marca Queues como beta e oferece entrega pelo menos uma vez. Manter estado de negócio/checkpoints no banco e adapter para reduzir dependência. Não instalar fila, workflow e Redis simultaneamente sem necessidade comprovada. [Vercel Queues](https://vercel.com/docs/queues).

Funções têm duração máxima e custo dependentes da configuração/plano; nenhum fluxo dependerá de execução indefinida ou de tarefa solta após responder ao HTTP. A disponibilidade e os custos reais de banco/executor ainda não foram verificados na conta. [Duração de funções](https://vercel.com/docs/functions/configuring-functions/duration).

## Prioridade dos riscos e critérios de saída

| Prioridade | Risco | Evidência necessária antes de liberar |
|---|---|---|
| Crítica, antes de dados reais | Vazamento entre empresas ou credenciais | Teste de acesso cruzado, cache isolado, segredo ausente no cliente e logs |
| Crítica, antes de OAuth real | Vínculo fraudulento ou tokens sobrescritos | State/replay/sessão testados e renovação concorrente validada |
| Alta, antes de importação | Timeout, limite ou duplicidade | Interromper lote e retomar; simular 429/5xx, duplicata e queda após persistência |
| Alta, antes de financeiro | Saldo e período incorretos | Título parcial, antigo, cancelado, reaberto e vencimento futuro conferidos |
| Alta, antes de métricas por produto | Itens/custos incompletos | Reconciliação de totais e sinalização de cobertura/estimativa |
| Alta, antes de webhooks | Evento inválido, fora de ordem ou perdido | Assinatura inválida recusada, duplicata segura, recuperação da fila demonstrada |
| Média | Drift do contrato, enums, tipos | Fixtures tolerantes a campos extras e teste de mudança de schema |
| Média | Custo e volume desconhecidos | Medir chamadas/duração por módulo e orçamento de infraestrutura |

Antes do deploy demonstrativo: build, rotas, segredos excluídos, dados claramente fictícios e callback com erro controlado. Os critérios de dados reais não impedem essa publicação inicial.

Antes de iniciar conexão real: URL cadastrada, persistência pronta, sessão do Hub válida e testes OAuth com mock. Depois, autorização do titular e conferência de campos efetivos, empresa/escopos, taxas, datas, exclusões, lote de estoque e comportamento de renovação.

## Revisão com Claude

Foi executado Claude Code local em modo não interativo, sem ferramentas ou MCP, recebendo somente plano e fatos documentais selecionados. Não recebeu valores do `.env`. A execução retornou limite de sessão atingido; **não houve parecer do Claude**. Registro em `REVISAO-CLAUDE.md`. Esta análise é do agente principal; revisão independente permanece pendente e não será tratada como realizada.

## Próxima etapa

Construir a base com design simples e contratos locais de demonstração; criar GitHub e publicar Vercel; testar callback; preparar banco/identidade/executor; conectar Bling; importar gradualmente e reconciliar antes de ampliar indicadores. Repositório remoto, deploy e chamadas autenticadas continuam não executados nesta etapa de análise.
