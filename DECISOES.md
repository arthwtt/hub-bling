# Decisões após revisão com Claude — 10/09/2026

O Claude revisou o documento com ferramentas desabilitadas, sem credenciais nem inspeção independente do OpenAPI. Seu parecer está em `REVISAO-CLAUDE.md`.

## Adotado nesta entrega

1. Frontend básico, sem biblioteca de design obrigatória. Dependências travadas no lockfile e Node 24 configurado no package.json.
2. Modo exclusivamente demonstrativo no código, banner permanente e origem marcada em exportações. Nenhuma flag permite misturar demo com dados reais.
3. Callback sem client secret, sem chamada externa e sem aceitar autorização. Retorno 303 para URL limpa e fixa. Ausência, duplicação, formato inválido e negativa de autorização têm respostas controladas.
4. Não criar cookie assinado de state só para o demo. Sem fluxo de autorização, isso acrescentaria estado sem benefício; state autêntico e consumo de uso único entram junto com login e persistência. O teste do demo não prova validade de state nem OAuth completo.
5. O `code` chega na query por protocolo. A regra correta é não refletir, persistir em logs ou propagar esse valor. A versão demo não registra queries e usa no-referrer/no-store. Logs do provedor ainda precisam ser avaliados antes de autorização real.
6. Sem banco/fila/workflow no demo. Isso não remove sua necessidade para integração real.

## Contratos reservados para a etapa real

Dados persistidos deverão ter tenant_id, bling_company_id como string, identificador do recurso, connection_version, timestamps de origem/coleta, versão do adapter e política de retenção do payload. Credenciais criptografadas terão versão da chave. A estratégia de chave e sua rotação serão definidas antes de armazenar tokens.

O parser para inteiros grandes deve operar no JSON bruto, antes de perda de precisão. Centavos inteiros e quantidades inteiras são suficientes somente para as fixtures atuais; dinheiro/quantidade reais exigirão adapter decimal.

Rotação de client secret afeta OAuth e assinatura dos webhooks. Procedimento de transição e reconexão será documentado antes de ativar esses recursos.

## Limites de comprovação

Build/testes demo não medem desempenho da API, renovação real, cobertura dos escopos ou consistência dos dados do usuário. A conectividade externa com callback será verificada após o deploy; toda autorização permanece bloqueada até a implementação da etapa real.
