import { notFound } from 'next/navigation';
import { Hub } from '@/components/hub';
import { sections } from '@/lib/navigation';

export function generateStaticParams() { return sections.map(section => ({ section })); }
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as typeof sections[number])) notFound();
  return <Hub key={section} section={section as typeof sections[number]} />;
}
