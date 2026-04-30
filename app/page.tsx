import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16 md:px-10">
        <section className="torn-paper torn-tilt-left p-8 md:p-10">
          <p className="mb-4 inline-flex rounded-full border border-amber-700/40 bg-amber-100/60 px-3 py-1 text-sm font-medium text-amber-900">
            Manga Creator Community
          </p>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                  TornPage
                </h1>
                <Image
                  src="/logo-6.png"
                  alt="TornPage logo"
                  width={96}
                  height={96}
                  className="h-[4.5rem] w-[4.5rem] rounded-lg object-contain md:h-24 md:w-24"
                  priority
                />
              </div>
              <p className="mt-4 max-w-2xl text-lg text-amber-950/85 md:text-xl">
                A platform where people can post their own manga and read
                stories from creators around the world.
              </p>
            </div>
            <p className="manga-quote max-w-xs text-right text-xs text-amber-900/90 md:pt-2">
              "Made by manga fans, for manga fans."
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="rounded-full bg-zinc-900 px-6 py-3 font-semibold text-amber-100 transition hover:bg-zinc-800"
            >
              Browse Manga
            </Link>
            <Link
              href="/upload"
              className="rounded-full border border-amber-900/40 px-6 py-3 font-semibold text-amber-900 transition hover:border-amber-900/70"
            >
              Upload Chapters
            </Link>
            <Link
              href="/manga-creator"
              className="rounded-full border border-amber-900/30 bg-amber-100/30 px-6 py-3 font-semibold text-amber-900 transition hover:bg-amber-100/45"
            >
              Make Manga
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm md:grid-cols-3">
            <p className="rounded-lg border border-amber-900/20 bg-amber-100/30 px-3 py-2 text-amber-950/90">
              Discover manga from creators across the world
            </p>
            <p className="rounded-lg border border-amber-900/20 bg-amber-100/30 px-3 py-2 text-amber-950/90">
              Enjoy every chapter with an amazing reader experience
            </p>
            <p className="rounded-lg border border-amber-900/20 bg-amber-100/30 px-3 py-2 text-amber-950/90">
              Post your own manga and build a real community and audience
            </p>
          </div>
        </section>

        <section id="features" className="space-y-6">
          <h2 className="text-3xl font-semibold">Everything You Need to Read and Publish</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Link
              href="/upload"
              className="torn-paper block p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-amber-900">
                Upload Manga Chapters
              </h3>
              <p className="mt-3 text-amber-950/85">
                Creators can publish new chapters quickly and keep readers
                updated with every release.
              </p>
            </Link>
            <Link
              href="/read"
              className="torn-paper torn-tilt-right block p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-amber-900">
                Read Manga Online
              </h3>
              <p className="mt-3 text-amber-950/85">
                Readers can enjoy manga in a clean, focused reading experience
                designed for long sessions.
              </p>
            </Link>
            <Link
              href="/browse"
              className="torn-paper block p-6 transition hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-amber-900">
                Browse the Community
              </h3>
              <p className="mt-3 text-amber-950/85">
                Discover fresh series, explore genres, and find new creators
                through an easy browsing flow.
              </p>
            </Link>
          </div>
        </section>

        <section className="torn-paper torn-tilt-right p-10">
          <h2 className="text-3xl font-semibold">Built for Creators and Readers</h2>
          <p className="mt-4 max-w-3xl text-amber-950/85">
            TornPage is where creators grow their audience and manga fans
            discover the next obsession. Share your chapters, connect with the
            community, and dive into stories that deserve the spotlight.
          </p>
        </section>

        <section
          id="contact"
          className="torn-paper p-10"
        >
          <h2 className="text-3xl font-semibold text-amber-950">Contact</h2>
          <p className="mt-4 text-amber-950/85">
            Want to partner with TornPage or ask a question?
          </p>
          <p className="mt-2 text-lg font-semibold text-amber-900">
            Phone: 804-690-2365
          </p>
        </section>
      </main>
    </div>
  );
}
