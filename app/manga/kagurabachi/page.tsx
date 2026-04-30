import Image from "next/image";
import Link from "next/link";

type Chapter = {
  number: number;
  title: string;
  volume: number;
  preview: string;
};

const chapters: Chapter[] = [
  { number: 1, title: "Scarlet Blade", volume: 1, preview: "/manga/kagurabachi/previews/ch-01.webp" },
  { number: 2, title: "What Lies Ahead", volume: 1, preview: "/manga/kagurabachi/previews/ch-02.webp" },
  { number: 3, title: "Enemy Signal", volume: 1, preview: "/manga/kagurabachi/previews/ch-03.png" },
  { number: 4, title: "Steel and Sorcery", volume: 1, preview: "/manga/kagurabachi/previews/ch-04.webp" },
  { number: 5, title: "The Resolve", volume: 1, preview: "/manga/kagurabachi/previews/ch-05.webp" },
  { number: 6, title: "Bound Oath", volume: 2, preview: "/covers/Kagurabachi.jpg" },
  { number: 7, title: "Bloodline", volume: 2, preview: "/covers/Kagurabachi.jpg" },
  { number: 8, title: "Crossroads", volume: 2, preview: "/covers/Kagurabachi.jpg" },
  { number: 9, title: "Retribution", volume: 2, preview: "/covers/Kagurabachi.jpg" },
  { number: 10, title: "Moonlit Clash", volume: 2, preview: "/covers/Kagurabachi.jpg" },
  { number: 11, title: "Black Furnace", volume: 3, preview: "/covers/Kagurabachi.jpg" },
  { number: 12, title: "Twin Edges", volume: 3, preview: "/covers/Kagurabachi.jpg" },
  { number: 13, title: "Requiem", volume: 3, preview: "/covers/Kagurabachi.jpg" },
  { number: 14, title: "Ashes", volume: 3, preview: "/covers/Kagurabachi.jpg" },
  { number: 15, title: "New Dawn", volume: 3, preview: "/covers/Kagurabachi.jpg" },
];

function chaptersByVolume() {
  const map = new Map<number, Chapter[]>();
  for (const chapter of chapters) {
    const existing = map.get(chapter.volume) ?? [];
    existing.push(chapter);
    map.set(chapter.volume, existing);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export default function KagurabachiSeriesPage() {
  const grouped = chaptersByVolume();

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative aspect-[3/4] w-full max-w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800">
              <Image
                src="/covers/Kagurabachi.jpg"
                alt="Kagurabachi cover"
                fill
                className="object-cover"
                sizes="224px"
                priority
              />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-amber-300">Kagurabachi</h1>
              <p className="max-w-2xl text-zinc-300">
                Browse chapters by volume, preview each chapter card, and start
                reading from chapter 1 or any chapter you choose.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/manga/kagurabachi/chapter/1"
                  className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
                >
                  Start Reading
                </Link>
                <Link
                  href="/browse"
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-300"
                >
                  Back to Browse
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-8">
          {grouped.map(([volume, volumeChapters]) => (
            <div key={volume} className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-100">
                Volume {volume}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {volumeChapters.map((chapter) => (
                  <Link
                    key={chapter.number}
                    href={`/manga/kagurabachi/chapter/${chapter.number}`}
                    className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 transition duration-200 hover:-translate-y-1 hover:border-amber-500/60"
                  >
                    <div className="relative aspect-[16/10] w-full bg-zinc-800">
                      <Image
                        src={chapter.preview}
                        alt={`Kagurabachi chapter ${chapter.number} preview`}
                        fill
                        className="object-cover transition duration-200 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-xs text-zinc-100">
                        Chapter preview
                      </div>
                    </div>
                    <div className="space-y-1 p-4">
                      <p className="text-sm font-semibold text-amber-300">
                        Chapter {chapter.number}
                      </p>
                      <h3 className="text-base font-semibold text-zinc-100">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-zinc-300">Volume {chapter.volume}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
