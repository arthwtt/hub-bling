import { notFound } from 'next/navigation';
import { Hub } from '@/components/hub';
import { sections, type Section } from '@/lib/navigation';
export function generateStaticParams(){return sections.map(section=>({section}));}
export default async function DemoSection({params}:{params:Promise<{section:string}>}) {
  const {section}=await params;
  if(!sections.includes(section as Section)) notFound();
  return <Hub key={section} section={section as Section} basePath="/demonstracao"/>;
}
