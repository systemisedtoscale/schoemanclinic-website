import type { ReactNode } from "react";
import { PageDocument } from "@/components/PageDocument";
import { findPage, notFoundPage } from "@/lib/pages";

/** The root layout: each page brings its own <head> (SEO tags, styles) and <body> classes. */
export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = findPage(slug) ?? notFoundPage();
  return <PageDocument page={page}>{children}</PageDocument>;
}
