# Inventário da API Bling v3

Fonte: https://developer.bling.com.br/referencia
Consulta: 2026-09-10. Inventário gerado do OpenAPI oficial; não representa validação dos endpoints com uma conta real.

| Método | Rota | Módulo | Descrição |
|---|---|---|---|
| GET | `/anuncios/categorias` | Anúncios - Categorias | Obtém categorias de anúncios |
| GET | `/anuncios/categorias/{idCategoria}` | Anúncios - Categorias | Obtém uma categoria de anúncio |
| GET | `/anuncios` | Anúncios | Obtém anúncios |
| POST | `/anuncios` | Anúncios | Cria um anúncio |
| GET | `/anuncios/{idAnuncio}` | Anúncios | Obtém um anúncio |
| PUT | `/anuncios/{idAnuncio}` | Anúncios | Altera um anúncio |
| DELETE | `/anuncios/{idAnuncio}` | Anúncios | Remove um anúncio |
| POST | `/anuncios/{idAnuncio}/publicar` | Anúncios | Publica um anúncio |
| POST | `/anuncios/{idAnuncio}/pausar` | Anúncios | Pausa um anúncio |
| GET | `/borderos/{idBordero}` | Borderôs | Obtém um borderô |
| DELETE | `/borderos/{idBordero}` | Borderôs | Remove um borderô |
| GET | `/campos-customizados/modulos` | Campos Customizados | Obtém módulos que possuem campos customizados |
| GET | `/campos-customizados/tipos` | Campos Customizados | Obtém tipos de campos customizados |
| GET | `/campos-customizados/modulos/{idModulo}` | Campos Customizados | Obtém campos customizados por módulo |
| GET | `/campos-customizados/{idCampoCustomizado}` | Campos Customizados | Obtém um campo customizado |
| PUT | `/campos-customizados/{idCampoCustomizado}` | Campos Customizados | Altera um campo customizado |
| DELETE | `/campos-customizados/{idCampoCustomizado}` | Campos Customizados | Remove um campo customizado |
| POST | `/campos-customizados` | Campos Customizados | Cria um campo customizado |
| PATCH | `/campos-customizados/{idCampoCustomizado}/situacoes` | Campos Customizados | Altera a situação de um campo customizado |
| GET | `/categorias/lojas` | Categorias - Lojas | Obtém categorias de lojas virtuais vinculadas a de produtos |
| POST | `/categorias/lojas` | Categorias - Lojas | Cria o vínculo de uma categoria da loja com a de produto |
| GET | `/categorias/lojas/{idCategoriaLoja}` | Categorias - Lojas | Obtém uma categoria da loja vinculada a de produto |
| PUT | `/categorias/lojas/{idCategoriaLoja}` | Categorias - Lojas | Altera o vínculo de uma categoria da loja com a de produto |
| DELETE | `/categorias/lojas/{idCategoriaLoja}` | Categorias - Lojas | Remove o vínculo de uma categoria da loja com a de produto |
| GET | `/categorias/produtos` | Categorias - Produtos | Obtém categorias de produtos |
| POST | `/categorias/produtos` | Categorias - Produtos | Cria uma categoria de produto |
| GET | `/categorias/produtos/{idCategoriaProduto}` | Categorias - Produtos | Obtém uma categoria de produto |
| PUT | `/categorias/produtos/{idCategoriaProduto}` | Categorias - Produtos | Altera uma categoria de produto |
| DELETE | `/categorias/produtos/{idCategoriaProduto}` | Categorias - Produtos | Remove uma categoria de produto |
| GET | `/categorias/receitas-despesas` | Categorias - Receitas e Despesas | Obtém categorias de receitas e despesas |
| POST | `/categorias/receitas-despesas` | Categorias - Receitas e Despesas | Cria uma categoria de receita e despesa |
| DELETE | `/categorias/receitas-despesas` | Categorias - Receitas e Despesas | Remove múltiplas categorias de receita e despesa |
| GET | `/categorias/receitas-despesas/{idCategoria}` | Categorias - Receitas e Despesas | Obtém uma categoria de receita e despesa |
| PUT | `/categorias/receitas-despesas/{idCategoria}` | Categorias - Receitas e Despesas | Atualiza uma categoria de receita e despesa |
| DELETE | `/categorias/receitas-despesas/{idCategoria}` | Categorias - Receitas e Despesas | Remove uma categoria de receita e despesa |
| GET | `/contas-contabeis` | Contas Financeiras | Obtém contas financeiras |
| GET | `/contas-contabeis/{idContaContabil}` | Contas Financeiras | Obtém uma conta financeira |
| GET | `/contas/receber` | Contas a Receber | Obtém contas a receber |
| POST | `/contas/receber` | Contas a Receber | Cria uma conta a receber |
| GET | `/contas/receber/{idContaReceber}` | Contas a Receber | Obtém uma conta a receber |
| PUT | `/contas/receber/{idContaReceber}` | Contas a Receber | Altera uma conta a receber |
| DELETE | `/contas/receber/{idContaReceber}` | Contas a Receber | Remove uma conta a receber |
| POST | `/contas/receber/{idContaReceber}/baixar` | Contas a Receber | Cria o recebimento de uma conta a receber |
| GET | `/contas/receber/boletos` | Contas a Receber | Obtém boletos de contas a receber |
| POST | `/contas/receber/boletos/cancelar` | Contas a Receber | Cancela boletos de contas a receber |
| GET | `/contatos` | Contatos | Obtém contatos |
| POST | `/contatos` | Contatos | Cria um contato |
| DELETE | `/contatos` | Contatos | Remove múltiplos contatos |
| GET | `/contatos/{idContato}` | Contatos | Obtém um contato |
| PUT | `/contatos/{idContato}` | Contatos | Altera um contato |
| DELETE | `/contatos/{idContato}` | Contatos | Remove um contato |
| GET | `/contatos/{idContato}/tipos` | Contatos | Obtém os tipos de contato de um contato |
| GET | `/contatos/consumidor-final` | Contatos | Obtém os dados do contato Consumidor Final |
| PATCH | `/contatos/{idContato}/situacoes` | Contatos | Altera a situação de um contato |
| POST | `/contatos/situacoes` | Contatos | Altera a situação de múltiplos contatos |
| GET | `/contatos/tipos` | Contatos - Tipos | Obtém tipos de contato |
| GET | `/contratos` | Contratos | Obtém contratos |
| POST | `/contratos` | Contratos | Cria um contrato |
| GET | `/contratos/{idContrato}` | Contratos | Obtém um contrato |
| PUT | `/contratos/{idContrato}` | Contratos | Altera um contrato |
| DELETE | `/contratos/{idContrato}` | Contratos | Remove um contrato |
| GET | `/depositos` | Depósitos | Obtém depósitos |
| POST | `/depositos` | Depósitos | Cria um depósito |
| GET | `/depositos/{idDeposito}` | Depósitos | Obtém um depósito |
| PUT | `/depositos/{idDeposito}` | Depósitos | Altera um depósito |
| GET | `/empresas/me/dados-basicos` | Empresas | Obtém dados básicos da empresa |
| GET | `/estoques/saldos/{idDeposito}` | Estoques | Obtém o saldo em estoque de produtos por depósito |
| GET | `/estoques/saldos` | Estoques | Obtém o saldo em estoque de produtos |
| POST | `/estoques` | Estoques | Cria um registro de estoque |
| PUT | `/estoques/{idEstoque}` | Estoques | Altera um registro de estoque |
| GET | `/produtos/lotes` | Produtos - Lotes | Obtém lotes de produtos |
| PUT | `/produtos/lotes` | Produtos - Lotes | Salva lotes de produtos |
| DELETE | `/produtos/lotes` | Produtos - Lotes | Remove lotes de produtos |
| GET | `/produtos/lotes/{idLote}` | Produtos - Lotes | Obtém um lote de um produto |
| PUT | `/produtos/lotes/{idLote}` | Produtos - Lotes | Altera um lote de um produto |
| GET | `/produtos/lotes/controla-lote` | Produtos - Lotes | Obtém a informação se determinados produtos possuem controle de lote |
| POST | `/produtos/{idProduto}/lotes/controla-lote/desativar` | Produtos - Lotes | Desativa controle de lotes para o produto |
| PATCH | `/produtos/lotes/{idLote}/status` | Produtos - Lotes | Altera o status de um lote do produto |
| GET | `/produtos/lotes/{idLote}/lancamentos` | Produtos - Lotes Lançamentos | Obtém os lançamentos de um lote de produto |
| POST | `/produtos/lotes/{idLote}/lancamentos` | Produtos - Lotes Lançamentos | Cria um lançamento de um lote |
| GET | `/produtos/lotes/lancamentos/{idLancamento}` | Produtos - Lotes Lançamentos | Obtém um lançamento de um lote de produto |
| PATCH | `/produtos/lotes/lancamentos/{idLancamento}` | Produtos - Lotes Lançamentos | Altera a observação de um lançamento de um lote de um produto |
| GET | `/produtos/{idProduto}/lotes/{idLote}/depositos/{idDeposito}/saldo` | Produtos - Lotes Lançamentos | Obtém o saldo de um lote de produto |
| GET | `/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo` | Produtos - Lotes Lançamentos | Obtém os saldos dos lotes de um produto por depósito |
| GET | `/produtos/{idProduto}/lotes/depositos/{idDeposito}/saldo/soma` | Produtos - Lotes Lançamentos | Obtém a soma dos saldos dos lotes de um produto em um depósito |
| GET | `/produtos/{idProduto}/lotes/saldo/soma` | Produtos - Lotes Lançamentos | Obtém o saldo total dos lotes de um produto |
| GET | `/formas-pagamentos` | Formas de Pagamentos | Obtém formas de pagamentos |
| POST | `/formas-pagamentos` | Formas de Pagamentos | Cria uma forma de pagamento |
| GET | `/formas-pagamentos/{idFormaPagamento}` | Formas de Pagamentos | Obtém uma forma de pagamento |
| PUT | `/formas-pagamentos/{idFormaPagamento}` | Formas de Pagamentos | Altera uma forma de pagamento |
| DELETE | `/formas-pagamentos/{idFormaPagamento}` | Formas de Pagamentos | Remove uma forma de pagamento |
| PATCH | `/formas-pagamentos/{idFormaPagamento}/padrao` | Formas de Pagamentos | Altera o padrão de uma forma de pagamento |
| PATCH | `/formas-pagamentos/{idFormaPagamento}/situacao` | Formas de Pagamentos | Altera a situação de uma forma de pagamento |
| GET | `/homologacao/produtos` | Homologação | Obtém o produto da homologação |
| POST | `/homologacao/produtos` | Homologação | Cria o produto da homologação |
| PUT | `/homologacao/produtos/{idProdutoHomologacao}` | Homologação | Altera o produto da homologação |
| DELETE | `/homologacao/produtos/{idProdutoHomologacao}` | Homologação | Remove o produto da homologação |
| PATCH | `/homologacao/produtos/{idProdutoHomologacao}/situacoes` | Homologação | Altera a situação do produto da homologação |
| GET | `/logisticas` | Logísticas | Obtém logísticas |
| POST | `/logisticas` | Logísticas | Cria logística |
| GET | `/logisticas/{idLogistica}` | Logísticas | Obtém uma logística |
| PUT | `/logisticas/{idLogistica}` | Logísticas | Altera uma logística |
| DELETE | `/logisticas/{idLogistica}` | Logísticas | Remove uma logística |
| GET | `/logisticas/servicos` | Logísticas - Serviços | Obtém serviços de logísticas |
| POST | `/logisticas/servicos` | Logísticas - Serviços | Cria um serviço de logística |
| GET | `/logisticas/servicos/{idLogisticaServico}` | Logísticas - Serviços | Obtém um servico de logística |
| PUT | `/logisticas/servicos/{idLogisticaServico}` | Logísticas - Serviços | Altera um serviço de logística pelo ID |
| PATCH | `/logisticas/{idLogisticaServico}/situacoes` | Logísticas - Serviços | Desativa ou ativa um serviço de uma logística |
| GET | `/logisticas/objetos/{idObjeto}` | Logísticas - Objetos | Obtém um objeto de logística |
| PUT | `/logisticas/objetos/{idObjeto}` | Logísticas - Objetos | Altera um objeto de logística pelo ID |
| DELETE | `/logisticas/objetos/{idObjeto}` | Logísticas - Objetos | Remove um objeto de logística personalizada |
| POST | `/logisticas/objetos` | Logísticas - Objetos | Cria um objeto de logística |
| GET | `/logisticas/etiquetas` | Logísticas - Etiquetas | Obtém etiquetas das vendas |
| GET | `/logisticas/remessas/{idRemessa}` | Logísticas - Remessas | Obtém uma remessa de postagem |
| PUT | `/logisticas/remessas/{idRemessa}` | Logísticas - Remessas | Altera uma remessa de postagem |
| DELETE | `/logisticas/remessas/{idRemessa}` | Logísticas - Remessas | Remove uma remessa de postagem |
| GET | `/logisticas/{idLogistica}/remessas` | Logísticas - Remessas | Obtém as remessas de postagem de uma logística |
| POST | `/logisticas/remessas` | Logísticas - Remessas | Cria uma remessa de postagem de uma logística |
| GET | `/naturezas-operacoes` | Naturezas de Operações | Obtém naturezas de operações |
| POST | `/naturezas-operacoes/{idNaturezaOperacao}/obter-tributacao` | Naturezas de Operações | Obtém regras de tributação da natureza de operação |
| GET | `/nfce` | Notas Fiscais de Consumidor Eletrônicas | Obtém notas fiscais de consumidor |
| POST | `/nfce` | Notas Fiscais de Consumidor Eletrônicas | Cria uma nota fiscal de consumidor |
| GET | `/nfce/{idNotaFiscalConsumidor}` | Notas Fiscais de Consumidor Eletrônicas | Obtém uma nota fiscal de consumidor |
| PUT | `/nfce/{idNotaFiscalConsumidor}` | Notas Fiscais de Consumidor Eletrônicas | Altera uma nota fiscal de consumidor |
| POST | `/nfce/{idNotaFiscalConsumidor}/enviar` | Notas Fiscais de Consumidor Eletrônicas | Envia uma nota de consumidor |
| POST | `/nfce/{idNotaFiscalConsumidor}/lancar-contas` | Notas Fiscais de Consumidor Eletrônicas | Lança as contas de uma nota fiscal |
| POST | `/nfce/{idNotaFiscalConsumidor}/estornar-contas` | Notas Fiscais de Consumidor Eletrônicas | Estorna as contas de uma nota fiscal |
| POST | `/nfce/{idNotaFiscalConsumidor}/lancar-estoque` | Notas Fiscais de Consumidor Eletrônicas | Lança o estoque de uma nota fiscal no depósito padrão |
| POST | `/nfce/{idNotaFiscalConsumidor}/lancar-estoque/{idDeposito}` | Notas Fiscais de Consumidor Eletrônicas | Lança o estoque de uma nota fiscal especificando o depósito |
| POST | `/nfce/{idNotaFiscalConsumidor}/estornar-estoque` | Notas Fiscais de Consumidor Eletrônicas | Estorna o estoque de uma nota fiscal |
| GET | `/nfe` | Notas Fiscais Eletrônicas | Obtém notas fiscais |
| POST | `/nfe` | Notas Fiscais Eletrônicas | Cria uma nota fiscal |
| DELETE | `/nfe` | Notas Fiscais Eletrônicas | Remove múltiplas notas fiscais |
| GET | `/nfe/{idNotaFiscal}` | Notas Fiscais Eletrônicas | Obtém uma nota fiscal |
| PUT | `/nfe/{idNotaFiscal}` | Notas Fiscais Eletrônicas | Altera uma nota fiscal |
| POST | `/nfe/{idNotaFiscal}/enviar` | Notas Fiscais Eletrônicas | Envia uma nota fiscal |
| POST | `/nfe/{idNotaFiscal}/lancar-contas` | Notas Fiscais Eletrônicas | Lança as contas de uma nota fiscal |
| POST | `/nfe/{idNotaFiscal}/estornar-contas` | Notas Fiscais Eletrônicas | Estorna as contas de uma nota fiscal |
| POST | `/nfe/{idNotaFiscal}/lancar-estoque` | Notas Fiscais Eletrônicas | Lança o estoque de uma nota fiscal no depósito padrão |
| POST | `/nfe/{idNotaFiscal}/lancar-estoque/{idDeposito}` | Notas Fiscais Eletrônicas | Lança o estoque de uma nota fiscal especificando o depósito |
| POST | `/nfe/{idNotaFiscal}/estornar-estoque` | Notas Fiscais Eletrônicas | Estorna o estoque de uma nota fiscal |
| GET | `/nfe/documento/{chaveAcesso}` | Notas Fiscais Eletrônicas | Obtém o documento de uma nota fiscal |
| GET | `/nfse` | Notas Fiscais de Serviço Eletrônicas | Obtém notas de serviços |
| POST | `/nfse` | Notas Fiscais de Serviço Eletrônicas | Cria uma nota de serviço |
| GET | `/nfse/{idNotaServico}` | Notas Fiscais de Serviço Eletrônicas | Obtém uma nota de serviço |
| DELETE | `/nfse/{idNotaServico}` | Notas Fiscais de Serviço Eletrônicas | Exclui uma nota de serviço |
| POST | `/nfse/{idNotaServico}/enviar` | Notas Fiscais de Serviço Eletrônicas | Envia uma nota de serviço |
| POST | `/nfse/{idNotaServico}/cancelar` | Notas Fiscais de Serviço Eletrônicas | Cancela uma nota de serviço |
| GET | `/nfse/configuracoes` | Notas Fiscais de Serviço Eletrônicas | Configurações de nota de serviço |
| PUT | `/nfse/configuracoes` | Notas Fiscais de Serviço Eletrônicas | Configurações de nota de serviço |
| GET | `/notificacoes` | Notificações | Obtém todas as notificações de uma empresa em um período |
| POST | `/notificacoes/{idNotificacao}/confirmar-leitura` | Notificações | Marca notificação como lida |
| GET | `/notificacoes/quantidade` | Notificações | Obtém a quantidade de notificações de uma empresa em um período |
| GET | `/propostas-comerciais` | Propostas Comerciais | Obtém propostas comerciais |
| POST | `/propostas-comerciais` | Propostas Comerciais | Cria uma proposta comercial |
| DELETE | `/propostas-comerciais` | Propostas Comerciais | Remove múltiplas propostas comerciais |
| GET | `/propostas-comerciais/{idPropostaComercial}` | Propostas Comerciais | Obtém uma proposta comercial |
| PUT | `/propostas-comerciais/{idPropostaComercial}` | Propostas Comerciais | Altera uma proposta comercial |
| DELETE | `/propostas-comerciais/{idPropostaComercial}` | Propostas Comerciais | Remove uma proposta comercial |
| PATCH | `/propostas-comerciais/{idPropostaComercial}/situacoes` | Propostas Comerciais | Altera a situação de uma proposta comercial |
| GET | `/pedidos/compras` | Pedidos - Compras | Obtém pedidos de compras |
| POST | `/pedidos/compras` | Pedidos - Compras | Cria um pedido de compra |
| GET | `/pedidos/compras/{idPedidoCompra}` | Pedidos - Compras | Obtém um pedido de compra |
| PUT | `/pedidos/compras/{idPedidoCompra}` | Pedidos - Compras | Altera um pedido de compra |
| DELETE | `/pedidos/compras/{idPedidoCompra}` | Pedidos - Compras | Remove um pedido de compra |
| PATCH | `/pedidos/compras/{idPedidoCompra}/situacoes/{idSituacao}` | Pedidos - Compras | Altera a situação de um pedido de compra |
| POST | `/pedidos/compras/{idPedidoCompra}/lancar-contas` | Pedidos - Compras | Lança as contas de um pedido de compra |
| POST | `/pedidos/compras/{idPedidoCompra}/estornar-contas` | Pedidos - Compras | Estorna as contas de um pedido de compra |
| POST | `/pedidos/compras/{idPedidoCompra}/lancar-estoque` | Pedidos - Compras | Lança o estoque de um pedido de compra |
| POST | `/pedidos/compras/{idPedidoCompra}/estornar-estoque` | Pedidos - Compras | Estorna o estoque de um pedido de compra |
| GET | `/produtos/estruturas/{idProdutoEstrutura}` | Produtos - Estruturas | Obtém a estrutura de um produto com composição |
| PUT | `/produtos/estruturas/{idProdutoEstrutura}` | Produtos - Estruturas | Altera a estrutura de um produto com composição |
| POST | `/produtos/estruturas/{idProdutoEstrutura}/componentes` | Produtos - Estruturas | Adiciona componente(s) a uma estrutura |
| DELETE | `/produtos/estruturas/{idProdutoEstrutura}/componentes` | Produtos - Estruturas | Remove componentes específicos de um produto com composição |
| PATCH | `/produtos/estruturas/{idProdutoEstrutura}/componentes/{idComponente}` | Produtos - Estruturas | Altera um componente de uma estrutura |
| DELETE | `/produtos/estruturas` | Produtos - Estruturas | Remove a estrutura de múltiplos produtos |
| GET | `/produtos/fornecedores` | Produtos - Fornecedores | Obtém produtos fornecedores |
| POST | `/produtos/fornecedores` | Produtos - Fornecedores | Cria um produto fornecedor |
| GET | `/produtos/fornecedores/{idProdutoFornecedor}` | Produtos - Fornecedores | Obtém um produto fornecedor |
| PUT | `/produtos/fornecedores/{idProdutoFornecedor}` | Produtos - Fornecedores | Altera um produto fornecedor |
| DELETE | `/produtos/fornecedores/{idProdutoFornecedor}` | Produtos - Fornecedores | Remove um produto fornecedor |
| GET | `/produtos/lojas` | Produtos - Lojas | Obtém vínculos de produtos com lojas |
| POST | `/produtos/lojas` | Produtos - Lojas | Cria o vínculo de um produto com uma loja |
| GET | `/produtos/lojas/{idProdutoLoja}` | Produtos - Lojas | Obtém um vínculo de produto com loja |
| PUT | `/produtos/lojas/{idProdutoLoja}` | Produtos - Lojas | Altera o vínculo de um produto com uma loja |
| DELETE | `/produtos/lojas/{idProdutoLoja}` | Produtos - Lojas | Remove o vínculo de um produto com uma loja |
| GET | `/produtos` | Produtos | Obtém produtos |
| POST | `/produtos` | Produtos | Cria um produto |
| DELETE | `/produtos` | Produtos | Remove múltiplos produtos |
| GET | `/produtos/{idProduto}` | Produtos | Obtém um produto |
| PUT | `/produtos/{idProduto}` | Produtos | Altera um produto |
| DELETE | `/produtos/{idProduto}` | Produtos | Remove um produto |
| PATCH | `/produtos/{idProduto}` | Produtos | Altera parcialmente um produto |
| PATCH | `/produtos/{idProduto}/situacoes` | Produtos | Altera a situação de um produto |
| POST | `/produtos/situacoes` | Produtos | Altera a situação de múltiplos produtos |
| GET | `/produtos/variacoes/{idProdutoPai}` | Produtos - Variações | Obtém o produto e variações |
| POST | `/produtos/variacoes/atributos/gerar-combinacoes` | Produtos - Variações | Retorna o produto pai com combinações de novas variações |
| PATCH | `/produtos/variacoes/{idProdutoPai}/atributos` | Produtos - Variações | Altera o nome do atributo nas variações |
| GET | `/situacoes/modulos` | Situações - Módulos | Obtém módulos |
| GET | `/situacoes/modulos/{idModuloSistema}` | Situações - Módulos | Obtém situações de um módulo |
| GET | `/situacoes/modulos/{idModuloSistema}/acoes` | Situações - Módulos | Obtém as ações de um módulo |
| GET | `/situacoes/modulos/{idModuloSistema}/transicoes` | Situações - Módulos | Obtém as transições de um módulo |
| GET | `/situacoes/{idSituacao}` | Situações | Obtém uma situação |
| PUT | `/situacoes/{idSituacao}` | Situações | Altera uma situação |
| DELETE | `/situacoes/{idSituacao}` | Situações | Remove uma situação |
| POST | `/situacoes` | Situações | Cria uma situação |
| GET | `/situacoes/transicoes/{idTransicao}` | Situações - Transições | Obtém uma transição |
| PUT | `/situacoes/transicoes/{idTransicao}` | Situações - Transições | Altera uma transição |
| DELETE | `/situacoes/transicoes/{idTransicao}` | Situações - Transições | Remove uma transição |
| POST | `/situacoes/transicoes` | Situações - Transições | Cria uma transição |
| POST | `/usuarios/recuperar-senha` | Usuários | Envia solicitação de recuperação de senha |
| PATCH | `/usuarios/redefinir-senha` | Usuários | Redefine senha do usuário |
| GET | `/usuarios/verificar-hash` | Usuários | Valida o hash recebido |
| GET | `/pedidos/vendas` | Pedidos - Vendas | Obtém pedidos de vendas |
| POST | `/pedidos/vendas` | Pedidos - Vendas | Cria um pedido de venda |
| DELETE | `/pedidos/vendas` | Pedidos - Vendas | Remove pedidos de vendas |
| GET | `/pedidos/vendas/{idPedidoVenda}` | Pedidos - Vendas | Obtém um pedido de venda |
| PUT | `/pedidos/vendas/{idPedidoVenda}` | Pedidos - Vendas | Altera um pedido de venda |
| DELETE | `/pedidos/vendas/{idPedidoVenda}` | Pedidos - Vendas | Remove um pedido de venda |
| PATCH | `/pedidos/vendas/{idPedidoVenda}/situacoes/{idSituacao}` | Pedidos - Vendas | Altera a situação de um pedido de venda |
| POST | `/pedidos/vendas/{idPedidoVenda}/lancar-estoque/{idDeposito}` | Pedidos - Vendas | Lança o estoque de um pedido de venda especificando o depósito |
| POST | `/pedidos/vendas/{idPedidoVenda}/lancar-estoque` | Pedidos - Vendas | Lança o estoque de um pedido de venda no depósito padrão |
| POST | `/pedidos/vendas/{idPedidoVenda}/estornar-estoque` | Pedidos - Vendas | Estorna o estoque de um pedido de venda |
| POST | `/pedidos/vendas/{idPedidoVenda}/lancar-contas` | Pedidos - Vendas | Lança as contas de um pedido de venda |
| POST | `/pedidos/vendas/{idPedidoVenda}/estornar-contas` | Pedidos - Vendas | Estorna as contas de um pedido de venda |
| POST | `/pedidos/vendas/{idPedidoVenda}/gerar-nfe` | Pedidos - Vendas | Gera nota fiscal eletrônica a partir do pedido de venda |
| POST | `/pedidos/vendas/{idPedidoVenda}/gerar-nfce` | Pedidos - Vendas | Gera nota fiscal de consumidor eletrônica a partir do pedido de venda |
| GET | `/vendedores` | Vendedores | Obtém vendedores |
| GET | `/vendedores/{idVendedor}` | Vendedores | Obtém um vendedor |
| GET | `/contas/pagar` | Contas a Pagar | Obtém contas a pagar |
| POST | `/contas/pagar` | Contas a Pagar | Cria uma conta a pagar |
| GET | `/contas/pagar/{idContaPagar}` | Contas a Pagar | Obtém uma conta a pagar |
| PUT | `/contas/pagar/{idContaPagar}` | Contas a Pagar | Atualiza uma conta a pagar |
| DELETE | `/contas/pagar/{idContaPagar}` | Contas a Pagar | Remove uma conta a pagar |
| POST | `/contas/pagar/{idContaPagar}/baixar` | Contas a Pagar | Cria o recebimento de uma conta a pagar |
| GET | `/canais-venda` | Canais de Venda | Obtém canais de venda |
| GET | `/canais-venda/{idCanalVenda}` | Canais de Venda | Obtém um canal de venda |
| GET | `/canais-venda/tipos` | Canais de Venda | Obtém os tipos de canais de venda |
| GET | `/ordens-producao` | Ordens de Produção | Obtém ordens de produção |
| POST | `/ordens-producao` | Ordens de Produção | Cria uma ordem de produção |
| GET | `/ordens-producao/{idOrdemProducao}` | Ordens de Produção | Obtém uma ordem de produção |
| PUT | `/ordens-producao/{idOrdemProducao}` | Ordens de Produção | Altera uma ordem de produção |
| DELETE | `/ordens-producao/{idOrdemProducao}` | Ordens de Produção | Remove uma ordem de produção |
| PUT | `/ordens-producao/{idOrdemProducao}/situacoes` | Ordens de Produção | Altera a situação de uma ordem de produção |
| POST | `/ordens-producao/gerar-sob-demanda` | Ordens de Produção | Gera ordens de produção sob demanda |
| GET | `/grupos-produtos` | Grupos de Produtos | Obtém grupos de produtos |
| POST | `/grupos-produtos` | Grupos de Produtos | Cria um grupo de produtos |
| DELETE | `/grupos-produtos` | Grupos de Produtos | Remove múltiplos grupos de produtos |
| GET | `/grupos-produtos/{idGrupoProduto}` | Grupos de Produtos | Obtém um grupo de produtos |
| PUT | `/grupos-produtos/{idGrupoProduto}` | Grupos de Produtos | Altera um grupo de produtos |
| DELETE | `/grupos-produtos/{idGrupoProduto}` | Grupos de Produtos | Remove um grupo de produtos |
| GET | `/caixas` | Caixas e Bancos | Obtém lista de lançamentos de caixas e bancos. |
| POST | `/caixas` | Caixas e Bancos | Cria um novo lançamento de caixa e banco. |
| GET | `/caixas/{idCaixa}` | Caixas e Bancos | Obtém um lançamento de caixa e banco. |
| PUT | `/caixas/{idCaixa}` | Caixas e Bancos | Atualiza um lançamento de caixa e banco. |
| DELETE | `/caixas/{idCaixa}` | Caixas e Bancos | Remove um lançamento de caixa e banco |
| GET | `/documentos-compartilhados/{token}` | Documentos Compartilhados | Obtém um documento compartilhado. |
