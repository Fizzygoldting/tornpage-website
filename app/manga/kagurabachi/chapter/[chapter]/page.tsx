import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ chapter: string }>;
};

const CHAPTER_COUNT = 15;

export function generateStaticParams() {
  return Array.from({ length: CHAPTER_COUNT }, (_, i) => ({
    chapter: String(i + 1),
  }));
}

export default async function KagurabachiChapterPage({ params }: Props) {
  const { chapter } = await params;
  const chapterNum = Number(chapter);
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > CHAPTER_COUNT) {
    notFound();
  }

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-5xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8">
          <p className="text-sm font-semibold text-amber-300">
            Kagurabachi · Chapter {chapterNum}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-100">
            Chapter {chapterNum} Reader
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-300">
            This chapter page is wired and ready. Plug your chapter page assets
            here and this route becomes a full reader for every chapter.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/manga/kagurabachi"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-300"
            >
              Back to chapters
            </Link>
            {chapterNum < CHAPTER_COUNT ? (
              <Link
                href={`/manga/kagurabachi/chapter/${chapterNum + 1}`}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
              >
                Next chapter
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
            <Image
              src="/covers/Kagurabachi.jpg"
              alt="Kagurabachi chapter preview"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <p className="mt-3 text-sm text-zinc-300">
            Preview area for chapter pages.
          </p>
        </section>
      </main>
    </div>
  );
}
