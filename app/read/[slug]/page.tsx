import { notFound } from "next/navigation";
import {
  getReadableManga,
  getReadableSlugs,
} from "@/lib/readableManga";
import { MangaReader } from "./MangaReader";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getReadableSlugs().map((slug) => ({ slug }));
}

export default async function ReadMangaSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const manga = getReadableManga(slug);
  if (!manga) notFound();

  return (
    <MangaReader title={manga.title} pageSrcs={manga.pageSrcs} />
  );
}
