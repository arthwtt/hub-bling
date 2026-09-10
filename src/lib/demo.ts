// Fonte fictícia e determinística. Nenhum dado ou identificador pertence a uma conta real.
export const DEMO_TODAY = "2026-09-10";
export const DEMO_START = "2026-06-13";
export type Channel = "Loja virtual" | "Marketplace" | "Loja física";
export const channels: Channel[] = [
  "Loja virtual",
  "Marketplace",
  "Loja física",
];
export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  physical: number;
  reserved: number;
};
export type Customer = {
  id: string;
  name: string;
  city: string;
  state: string;
};
export type Order = {
  id: string;
  date: string;
  channel: Channel;
  customerId: string;
  status: "Concluído" | "Em andamento" | "Cancelado";
  items: { productId: string; quantity: number; unitPrice: number }[];
  total: number;
};
export type Bill = {
  id: string;
  kind: "receber" | "pagar";
  name: string;
  issued: string;
  due: string;
  value: number;
  balance: number;
  status: "Aberto" | "Parcial" | "Liquidado" | "Cancelado";
};
export type DemoData = {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  bills: Bill[];
};
export const shiftDate = (date: string, days: number) =>
  new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);

const products: Product[] = [
  {
    id: "p1",
    name: "Garrafa térmica 750 ml",
    sku: "GAR-750",
    category: "Utilidades",
    price: 8990,
    cost: 3800,
    physical: 84,
    reserved: 12,
  },
  {
    id: "p2",
    name: "Mochila urbana",
    sku: "MOC-001",
    category: "Acessórios",
    price: 18990,
    cost: 8200,
    physical: 28,
    reserved: 7,
  },
  {
    id: "p3",
    name: "Caderno pontilhado A5",
    sku: "CAD-A5",
    category: "Papelaria",
    price: 3990,
    cost: 1400,
    physical: 160,
    reserved: 24,
  },
  {
    id: "p4",
    name: "Luminária de mesa",
    sku: "LUM-002",
    category: "Casa",
    price: 15990,
    cost: 7100,
    physical: 12,
    reserved: 5,
  },
  {
    id: "p5",
    name: "Organizador de mesa",
    sku: "ORG-001",
    category: "Casa",
    price: 5990,
    cost: 2300,
    physical: 65,
    reserved: 8,
  },
  {
    id: "p6",
    name: "Ecobag algodão",
    sku: "ECO-001",
    category: "Acessórios",
    price: 2990,
    cost: 900,
    physical: 120,
    reserved: 11,
  },
  {
    id: "p7",
    name: "Copo cerâmica 300 ml",
    sku: "COP-300",
    category: "Utilidades",
    price: 4990,
    cost: 1900,
    physical: 9,
    reserved: 6,
  },
  {
    id: "p8",
    name: "Estojo modular",
    sku: "EST-003",
    category: "Papelaria",
    price: 4590,
    cost: 1700,
    physical: 46,
    reserved: 3,
  },
];
const customers: Customer[] = [
  { id: "c1", name: "Ana Lima", city: "São Paulo", state: "SP" },
  { id: "c2", name: "Bruno Costa", city: "Curitiba", state: "PR" },
  { id: "c3", name: "Carla Santos", city: "Belo Horizonte", state: "MG" },
  { id: "c4", name: "Diego Alves", city: "Rio de Janeiro", state: "RJ" },
  { id: "c5", name: "Elisa Rocha", city: "Florianópolis", state: "SC" },
  { id: "c6", name: "Felipe Souza", city: "Campinas", state: "SP" },
  { id: "c7", name: "Gabriela Dias", city: "Porto Alegre", state: "RS" },
  { id: "c8", name: "Henrique Melo", city: "Recife", state: "PE" },
  { id: "c9", name: "Isabela Reis", city: "Salvador", state: "BA" },
  { id: "c10", name: "João Martins", city: "Brasília", state: "DF" },
  { id: "c11", name: "Larissa Nunes", city: "Santos", state: "SP" },
  { id: "c12", name: "Marcos Ribeiro", city: "Goiânia", state: "GO" },
];
const orders: Order[] = Array.from({ length: 360 }, (_, i) => {
  const product = products[(i * 7 + Math.floor(i / 9)) % products.length];
  const second = products[(i + 3) % products.length];
  const items = [
    { productId: product.id, quantity: 1 + (i % 3), unitPrice: product.price },
  ];
  if (i % 3 === 0)
    items.push({ productId: second.id, quantity: 1, unitPrice: second.price });
  return {
    id: `PV-${10401 + i}`,
    date: shiftDate(DEMO_START, Math.floor(i / 4)),
    channel: channels[(i + Math.floor(i / 11)) % 3],
    customerId: customers[(i * 5 + Math.floor(i / 17)) % customers.length].id,
    status:
      i % 17 === 0
        ? "Cancelado"
        : i > 340 && i % 3 === 0
          ? "Em andamento"
          : "Concluído",
    items,
    total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  };
});
const bills: Bill[] = Array.from({ length: 48 }, (_, i) => {
  const value = 23500 + ((i * 19731) % 280000);
  const status: Bill["status"] =
    i % 13 === 0
      ? "Cancelado"
      : i % 4 === 0
        ? "Liquidado"
        : i % 5 === 0
          ? "Parcial"
          : "Aberto";
  return {
    id: `TF-${2101 + i}`,
    kind: i % 3 === 0 ? "pagar" : "receber",
    name:
      i % 3 === 0
        ? [
            "Fornecedor Aurora",
            "Embalagens Sul",
            "Aluguel comercial",
            "Serviços operacionais",
          ][i % 4]
        : customers[i % customers.length].name,
    issued: shiftDate(DEMO_TODAY, -45 - (i % 15)),
    due: shiftDate(DEMO_TODAY, i - 25),
    value,
    balance:
      status === "Cancelado" || status === "Liquidado"
        ? 0
        : status === "Parcial"
          ? Math.round(value * 0.4)
          : value,
    status,
  };
});
export const demoData: DemoData = { products, customers, orders, bills };
