import Image from "next/image";
import Link from "next/link";
import { MANGA_BROWSE_CARDS } from "@/lib/browseManga";

const recentlyReadSpec: { title: string; progress: string }[] = [
  { title: "Kagurabachi", progress: "Ch. 4 · Page 12 · 38%" },
  { title: "Blue Lock", progress: "Ch. 21 · 64%" },
  { title: "20th Century Boys", progress: "Vol. 2 · 52%" },
  { title: "Jujutsu Kaisen", progress: "Ch. 9 · Page 8 · 22%" },
  { title: "The Promised Neverland", progress: "Ch. 15 · 71%" },
];

const bookmarkedSpec: { title: string; savedNote: string }[] = [
  { title: "Blue", savedNote: "Saved from trending uploads" },
  { title: "Kagurabachi", savedNote: "You bookmarked this for weekly updates" },
  { title: "Silent Hill F Manga", savedNote: "Saved for late-night reading" },
  { title: "20th Century Boys", savedNote: "Saved for your psychological list" },
  { title: "Mario (One-Shot)", savedNote: "Saved as a quick one-shot pick" },
  { title: "Blue Lock", savedNote: "Saved for action/sports sessions" },
];

function coverSrcForTitle(title: string): string | null {
  const card = MANGA_BROWSE_CARDS.find((c) => c.title === title);
  if (!card) return null;
  if (card.coverSrc) return card.coverSrc;
  if (card.coverFile) return `/covers/${encodeURIComponent(card.coverFile)}`;
  return null;
}

function recentlyReadItems() {
  return recentlyReadSpec.map((spec) => {
    return { ...spec, coverSrc: coverSrcForTitle(spec.title) };
  });
}

function bookmarkedItems() {
  return bookmarkedSpec.map((spec) => ({
    ...spec,
    coverSrc: coverSrcForTitle(spec.title),
  }));
}

export default function ReadPage() {
  const recent = recentlyReadItems();
  const bookmarked = bookmarkedItems();

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
        <h1 className="text-4xl font-bold text-amber-300">Read Manga</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">
          Continue where you left off, or open a title in the reader. Scroll
          through pages or switch to book-style page turns.
        </p>
      </section>

        <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-100">
            Recently read
          </h2>
          <p className="text-sm text-zinc-400">
            Same covers as Browse; progress is sample data until accounts sync.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {recent.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70"
            >
              <div className="relative aspect-[3/4] w-full bg-zinc-800">
                {item.coverSrc ? (
                  <Image
                    src={item.coverSrc}
                    alt={`${item.title} cover`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    No cover
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                <p className="text-sm text-amber-200/90">{item.progress}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

        <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-semibold text-zinc-100">
            Saved / Bookmarked Manga
          </h2>
          <p className="text-sm text-zinc-400">
            Personalized picks mixed from your classic and newer uploads.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {bookmarked.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-900/75"
            >
              <div className="relative aspect-[16/9] w-full bg-zinc-800">
                {item.coverSrc ? (
                  <Image
                    src={item.coverSrc}
                    alt={`${item.title} cover`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    No cover
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-100">{item.title}</h3>
                  <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                    Saved
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{item.savedNote}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

        <section className="mt-14">
        <h2 className="text-2xl font-semibold text-zinc-100">
          Available in reader
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Spy × Family is wired as a test volume with local pages. Choose scroll
          or book mode inside the reader.
        </p>
        <div className="mt-6 max-w-sm">
          <Link
            href="/read/spy-x-family"
            className="block overflow-hidden rounded-2xl border border-amber-500/35 bg-zinc-900/80 shadow-lg shadow-amber-900/10 transition hover:border-amber-400/60 hover:shadow-amber-900/20"
          >
            <div className="relative aspect-[3/4] w-full bg-zinc-800">
              <Image
                src="/manga/spy-x-family/Cover.webp"
                alt="Spy × Family cover"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 384px"
                priority
              />
            </div>
            <div className="space-y-1 p-4">
              <h3 className="text-lg font-semibold text-zinc-50">
                Spy × Family
              </h3>
              <p className="text-sm text-zinc-400">Test reader · 54 pages</p>
              <p className="text-sm font-medium text-amber-300">
                Open reader →
              </p>
            </div>
          </Link>
        </div>
        </section>
      </main>
    </div>
  );
}
