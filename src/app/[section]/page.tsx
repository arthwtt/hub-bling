import { notFound, redirect } from "next/navigation";
import { Hub } from "@/components/hub";
import { sections } from "@/lib/navigation";
import { liveMode } from "@/server/config";
import { session } from "@/server/auth";
import { LiveHub } from "@/components/live-hub";

export const dynamic = "force-dynamic";
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ integracao?: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  if (liveMode()) {
    const user = await session();
    if (!user) redirect("/login");
    const query = await searchParams;
    return (
      <LiveHub
        section={section as (typeof sections)[number]}
        ownerId={user.ownerId}
        result={query.integracao}
      />
    );
  }
  return <Hub key={section} section={section as (typeof sections)[number]} />;
}
