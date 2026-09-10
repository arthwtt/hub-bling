export const sections = [
  "visao-geral",
  "vendas",
  "produtos",
  "financeiro",
  "clientes",
  "configuracoes",
] as const;
export type Section = (typeof sections)[number];
