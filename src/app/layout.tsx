import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Hub Bling · Central de informações', description: 'Central de vendas, estoque, financeiro e clientes. Versão demonstrativa.', robots: { index: false, follow: false } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
