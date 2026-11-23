import { notFound } from "next/navigation";
import { PageMain } from "@/components/PageDocument";
import { findPage, routablePages, slugOf } from "@/lib/pages";

/** One static page per file in src/data/pages, at the live site's address. */
export function generateStaticParams() {
  return routablePages().map((page) => ({ slug: slugOf(page) }));
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) notFound();
  return <PageMain page={page} />;
}
