# Auditoria estrutural do OpenAPI Bling

Snapshot consultado em 10/09/2026. Gerado por `node analisar-openapi.mjs`.

Fonte: https://developer.bling.com.br/referencia
JSON público: https://developer.bling.com.br/build/assets/openapi-DKXp8d1e.json

SHA-256 do arquivo local: `d9e3244dc6849cc2ad42167a3e924d4e2e3ded9d01ab0be724b10fb24bce4233`.

- Rotas: 162.
- Operações: 257; GET: 98.
- Schemas: 407.

A varredura abrange todas as operações e referências locais. Aponta ambiguidades estruturais; não é um validador completo de OpenAPI nem comprova o comportamento do servidor.

## Cobertura das operações de leitura

Ausência de filtro significa apenas que ele não está declarado no snapshot. Não enviar parâmetros presumidos.

| GET | Módulo | Parâmetros declarados | Respostas declaradas |
|---|---|---|---|
| `/anuncios/categorias` | Anúncios - Categorias | tipoIntegracao, idLoja, idCategoria, tipoProduto | 200, 400 |
| `/anuncios/categorias/{idCategoria}` | Anúncios - Categorias | idCategoria, tipoIntegracao, idLoja | 200, 400, 404 |
| `/anuncios` | Anúncios | pagina, limite, situacao, idProduto, tipoIntegracao, idLoja | 200, 400 |
| `/anuncios/{idAnuncio}` | Anúncios | idAnuncio, tipoIntegracao, idLoja | 200, 400, 404 |
| `/borderos/{idBordero}` | Borderôs | idBordero | 200, 404 |
| `/campos-customizados/modulos` | Campos Customizados | — | 200 |
| `/campos-customizados/tipos` | Campos Customizados | — | 200 |
| `/campos-customizados/modulos/{idModulo}` | Campos Customizados | idModulo, pagina, limite | 200 |
| `/campos-customizados/{idCampoCustomizado}` | Campos Customizados | idCampoCustomizado | 200, 404 |
| `/categorias/lojas` | Categorias - Lojas | pagina, limite, idLoja, idCategoriaProduto, idCategoriaProdutoPai | 200 |
| `/categorias/lojas/{idCategoriaLoja}` | Categorias - Lojas | idCategoriaLoja | 200, 404 |
| `/categorias/produtos` | Categorias - Produtos | pagina, limite | 200 |
| `/categorias/produtos/{idCategoriaProduto}` | Categorias - Produtos | idCategoriaProduto | 200, 404 |
| `/categorias/receitas-despesas` | Categorias - Receitas e Despesas | pagina, limite, tipo, situacao | 200 |
| `/categorias/receitas-despesas/{idCategoria}` | Categorias - Receitas e Despesas | idCategoria | 200, 404 |
| `/contas-contabeis` | Contas Financeiras | pagina, limite, ocultarInvisiveis, ocultarTipoContaBancaria, situacoes, aliasIntegracao, aliasIntegracao, ordenacao | 200 |
| `/contas-contabeis/{idContaContabil}` | Contas Financeiras | idContaContabil | 200, 404 |
| `/contas/receber` | Contas a Receber | pagina, limite, situacoes[], tipoFiltroData, dataInicial, dataFinal, idsCategorias[], idPortador, idContato, idVendedor, idFormaPagamento, boletoGerado | 200 |
| `/contas/receber/{idContaReceber}` | Contas a Receber | idContaReceber | 200, 404 |
| `/contas/receber/boletos` | Contas a Receber | idOrigem, situacoes[] | 200, 400, 404 |
| `/contatos` | Contatos | pagina, limite, pesquisa, criterio, dataInclusaoInicial, dataInclusaoFinal, dataAlteracaoInicial, dataAlteracaoFinal, idTipoContato, idVendedor, uf, telefone, idsContatos[], numeroDocumento, tipoPessoa | 200 |
| `/contatos/{idContato}` | Contatos | idContato | 200, 404 |
| `/contatos/{idContato}/tipos` | Contatos | idContato | 200, 404 |
| `/contatos/consumidor-final` | Contatos | — | 200 |
| `/contatos/tipos` | Contatos - Tipos | — | 200 |
| `/contratos` | Contratos | pagina, limite, dataCriacaoInicio, dataCriacaoFinal, dataBaseInicio, dataBaseFinal, situacao, idContato, idContatoCobranca | 200 |
| `/contratos/{idContrato}` | Contratos | idContrato | 200, 404 |
| `/depositos` | Depósitos | pagina, limite, descricao, situacao | 200 |
| `/depositos/{idDeposito}` | Depósitos | idDeposito | 200, 404 |
| `/empresas/me/dados-basicos` | Empresas | — | 200 |
| `/estoques/saldos/{idDeposito}` | Estoques | idDeposito, idsProdutos[], codigos[], filtroSaldoEstoque | 200, 400, 404 |
| `/estoques/saldos` | Estoques | idsProdutos[], codigos[], filtroSaldoEstoque | 200, 400 |
| `/produtos/lotes` | Produtos - Lotes | pagina, limite, idsProdutos[], idsLotes[], idsDepositos[], codigosLotes[], status, dataValidadeInicial, dataValidadeFinal, dataFabricacaoInicial, dataFabricacaoFinal, dataCriacaoInicial, dataCriacaoFinal | 200, 400 |
| `/produtos/lotes/{idLote}` | Produtos - Lotes | idLote | 200, 404 |
| `/produtos/lotes/controla-lote` | Produtos - Lotes | idsProdutos[] | 200, 400 |
| `/produtos/lotes/{idLote}/lancamentos` | Produtos - Lotes Lançamentos | idLote | 200, 400, 404 |
| `/produtos/lotes/lancamentos/{idLancamento}` | Produtos - Lotes Lançamentos | idLancamento | 200, 400, 404 |
| `/produtos/{idProduto}/lotes/{idLote}/depositos/{idDeposito}/saldo` | Produtos - Lotes Lançamentos | idLote, idProduto, idDeposito | 200, 404 |
| `/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo` | Produtos - Lotes Lançamentos | idsLotes[], idProduto, idDeposito | 200, 400, 404 |
| `/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo/soma` | Produtos - Lotes Lançamentos | idProduto, idDeposito | 200, 400, 404 |
| `/produtos/{idProduto}/lotes/saldo/soma` | Produtos - Lotes Lançamentos | idProduto | 200, 404 |
| `/formas-pagamentos` | Formas de Pagamentos | pagina, limite, descricao, tiposPagamentos[], situacao | 200 |
| `/formas-pagamentos/{idFormaPagamento}` | Formas de Pagamentos | idFormaPagamento | 200, 404 |
| `/homologacao/produtos` | Homologação | — | 200 |
| `/logisticas` | Logísticas | pagina, limite, tipoIntegracao, tiposIntegracoes[], situacao, logisticasReversas | 200, 404 |
| `/logisticas/{idLogistica}` | Logísticas | idLogistica, listarServicosInativos | 200, 404 |
| `/logisticas/servicos` | Logísticas - Serviços | pagina, limite, tipoIntegracao | 200, 400 |
| `/logisticas/servicos/{idLogisticaServico}` | Logísticas - Serviços | idLogisticaServico | 200, 404 |
| `/logisticas/objetos/{idObjeto}` | Logísticas - Objetos | idObjeto | 200, 404 |
| `/logisticas/etiquetas` | Logísticas - Etiquetas | formato, idsVendas[] | 200, 400, 404 |
| `/logisticas/remessas/{idRemessa}` | Logísticas - Remessas | idRemessa | 200, 404 |
| `/logisticas/{idLogistica}/remessas` | Logísticas - Remessas | idLogistica, situacao | 200, 400, 404 |
| `/naturezas-operacoes` | Naturezas de Operações | pagina, limite, situacao, descricao | 200, 400 |
| `/nfce` | Notas Fiscais de Consumidor Eletrônicas | pagina, limite, idTransportador, chaveAcesso, numero, serie, situacao, dataEmissaoInicial, dataEmissaoFinal | 200, 404 |
| `/nfce/{idNotaFiscalConsumidor}` | Notas Fiscais de Consumidor Eletrônicas | idNotaFiscalConsumidor | 200, 404 |
| `/nfe` | Notas Fiscais Eletrônicas | pagina, limite, numeroLoja, idTransportador, chaveAcesso, numero, serie, situacao, tipo, dataEmissaoInicial, dataEmissaoFinal | 200 |
| `/nfe/{idNotaFiscal}` | Notas Fiscais Eletrônicas | idNotaFiscal | 200, 404 |
| `/nfe/documento/{chaveAcesso}` | Notas Fiscais Eletrônicas | chaveAcesso, formato | 200, 400, 404 |
| `/nfse` | Notas Fiscais de Serviço Eletrônicas | pagina, limite, situacao, dataEmissaoInicial, dataEmissaoFinal | 200, 400 |
| `/nfse/{idNotaServico}` | Notas Fiscais de Serviço Eletrônicas | idNotaServico | 200, 404 |
| `/nfse/configuracoes` | Notas Fiscais de Serviço Eletrônicas | — | 200 |
| `/notificacoes` | Notificações | periodo | 200, 400 |
| `/notificacoes/quantidade` | Notificações | periodo | 200, 400 |
| `/propostas-comerciais` | Propostas Comerciais | situacao, idContato, dataInicial, dataFinal, pagina, limite | 200 |
| `/propostas-comerciais/{idPropostaComercial}` | Propostas Comerciais | idPropostaComercial | 200, 404 |
| `/pedidos/compras` | Pedidos - Compras | pagina, limite, idFornecedor, valorSituacao, idSituacao, dataInicial, dataFinal, idsNotasFiscais[] | 200 |
| `/pedidos/compras/{idPedidoCompra}` | Pedidos - Compras | idPedidoCompra | 200, 404 |
| `/produtos/estruturas/{idProdutoEstrutura}` | Produtos - Estruturas | idProdutoEstrutura | 200, 404 |
| `/produtos/fornecedores` | Produtos - Fornecedores | pagina, limite, idProduto, idFornecedor | 200 |
| `/produtos/fornecedores/{idProdutoFornecedor}` | Produtos - Fornecedores | idProdutoFornecedor | 200, 404 |
| `/produtos/lojas` | Produtos - Lojas | pagina, limite, idProduto, idLoja, idCategoriaProduto, dataAlteracaoInicial, dataAlteracaoFinal | 200, 400 |
| `/produtos/lojas/{idProdutoLoja}` | Produtos - Lojas | idProdutoLoja | 200, 404 |
| `/produtos` | Produtos | pagina, limite, criterio, tipo, idComponente, dataInclusaoInicial, dataInclusaoFinal, dataAlteracaoInicial, dataAlteracaoFinal, idCategoria, idLoja, nome, idsProdutos[], codigos[], gtins[], filtroSaldoEstoque, filtroSaldoEstoqueDeposito | 200 |
| `/produtos/{idProduto}` | Produtos | idProduto | 200, 403, 404 |
| `/produtos/variacoes/{idProdutoPai}` | Produtos - Variações | idProdutoPai | 200, 404 |
| `/situacoes/modulos` | Situações - Módulos | — | 200 |
| `/situacoes/modulos/{idModuloSistema}` | Situações - Módulos | idModuloSistema | 200, 404 |
| `/situacoes/modulos/{idModuloSistema}/acoes` | Situações - Módulos | idModuloSistema | 200, 404 |
| `/situacoes/modulos/{idModuloSistema}/transicoes` | Situações - Módulos | idModuloSistema | 200, 404 |
| `/situacoes/{idSituacao}` | Situações | idSituacao | 200, 404 |
| `/situacoes/transicoes/{idTransicao}` | Situações - Transições | idTransicao | 200, 404 |
| `/usuarios/verificar-hash` | Usuários | hash | 200, 400 |
| `/pedidos/vendas` | Pedidos - Vendas | pagina, limite, idContato, idsSituacoes[], dataInicial, dataFinal, dataAlteracaoInicial, dataAlteracaoFinal, dataPrevistaInicial, dataPrevistaFinal, numero, idLoja, idVendedor, idControleCaixa, numerosLojas[], idUnidadeNegocio | 200 |
| `/pedidos/vendas/{idPedidoVenda}` | Pedidos - Vendas | idPedidoVenda | 200, 404 |
| `/vendedores` | Vendedores | pagina, limite, nomeContato, situacaoContato, idContato, idLoja, dataAlteracaoInicial, dataAlteracaoFinal | 200 |
| `/vendedores/{idVendedor}` | Vendedores | idVendedor | 200, 404 |
| `/contas/pagar` | Contas a Pagar | pagina, limite, dataEmissaoInicial, dataEmissaoFinal, dataVencimentoInicial, dataVencimentoFinal, dataPagamentoInicial, dataPagamentoFinal, situacao, idContato | 200 |
| `/contas/pagar/{idContaPagar}` | Contas a Pagar | idContaPagar | 200, 404 |
| `/canais-venda` | Canais de Venda | pagina, limite, tipos[], situacao, agrupador | 200 |
| `/canais-venda/{idCanalVenda}` | Canais de Venda | idCanalVenda | 200, 404 |
| `/canais-venda/tipos` | Canais de Venda | agrupador | 200 |
| `/ordens-producao` | Ordens de Produção | pagina, limite, idsSituacoes[] | 200 |
| `/ordens-producao/{idOrdemProducao}` | Ordens de Produção | idOrdemProducao | 200, 404 |
| `/grupos-produtos` | Grupos de Produtos | nome, nomePai, pagina, limite | 200 |
| `/grupos-produtos/{idGrupoProduto}` | Grupos de Produtos | idGrupoProduto | 200, 404 |
| `/caixas` | Caixas e Bancos | pagina, dataInicial, dataFinal, idsCategorias, idContaFinanceira, pesquisa, valor, situacaoConciliacao, situacao | 200, 400 |
| `/caixas/{idCaixa}` | Caixas e Bancos | idCaixa | 200, 404 |
| `/documentos-compartilhados/{token}` | Documentos Compartilhados | token | 302 |

## Pontos estruturais para revisão

- required sem propriedade local: #/components/schemas/CaixasBancosSalvarLancamentoDTO -> idContaContabil
- required sem propriedade local: #/components/schemas/CamposCustomizadosAgrupadorDTO -> agrupador
- required sem propriedade local: #/components/schemas/FormasPagamentosDadosDTO -> finalidade
- required sem propriedade local: #/components/schemas/LogisticasObjetosUpdateRequestDTO -> dimensao
- required sem propriedade local: #/components/schemas/NotasFiscaisDadosGetDTO -> data
- required sem propriedade local: #/components/schemas/NotasFiscaisDadosGetDTO -> valor
- required sem propriedade local: #/components/schemas/NotasFiscaisDadosPostDTO -> data
- required sem propriedade local: #/components/schemas/NotasFiscaisDadosPostDTO -> valor
- required sem propriedade local: #/components/schemas/NotasFiscaisTransporteGetDTO -> numero
- required sem propriedade local: #/components/schemas/NotasFiscaisTransporteGetDTO -> serie
- required sem propriedade local: #/components/schemas/NotasFiscaisTransporteGetDTO -> data
- required sem propriedade local: #/components/schemas/NotasFiscaisTransportePostDTO -> numero
- required sem propriedade local: #/components/schemas/NotasFiscaisTransportePostDTO -> serie
- required sem propriedade local: #/components/schemas/NotasFiscaisTransportePostDTO -> data
- required sem propriedade local: #/components/schemas/NotasServicosDadosBase -> contato
- required sem propriedade local: #/components/schemas/OrdensProducaoDepositoDTO -> destino
- required sem propriedade local: #/components/schemas/OrdensProducaoDepositoDTO -> origem
- required sem propriedade local: #/components/schemas/ProdutosVariacaoDTO -> atributos
- required sem propriedade local: #/components/schemas/ProdutosFornecedoresDadosDTO -> produto
- required sem propriedade local: #/components/schemas/ProdutosFornecedoresDadosDTO -> fornecedor
- required sem propriedade local: #/components/schemas/ProdutosFornecedoresDadosUpdateDTO -> produto
- required sem propriedade local: #/components/schemas/VendasItemDTO -> valorLista
- required sem propriedade local: #/components/schemas/ErrorResponse -> error.type
- required sem propriedade local: #/components/schemas/ErrorResponse -> message
- required sem propriedade local: #/components/schemas/ErrorResponse -> description

Um schema com allOf pode complementar propriedades em outro componente. Os achados required acima precisam de revisão contextual antes de classificá-los como defeito.
