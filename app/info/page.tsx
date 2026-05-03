import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is TornPage? · TornPage",
  description:
    "Community-first manga: read and share work from creators worldwide, with a reader built for long sessions.",
};

export default function InfoPage() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-3xl px-6 py-16 md:px-10">
        <header className="mb-12 flex flex-col gap-6 border-b border-zinc-800 pb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-amber-300/90">
              About this site
            </p>
            <h1 className="mt-2 text-4xl font-bold text-zinc-50 md:text-5xl">
              TornPage
            </h1>
            <p className="mt-3 text-lg text-amber-200/90">
              Manga for everyone.
            </p>
          </div>
          <Image
            src="/tornpage-home-logo.png"
            alt=""
            width={120}
            height={72}
            className="h-14 w-auto object-contain object-left sm:h-16"
            priority
          />
        </header>

        <div className="space-y-10 text-zinc-300">
          <section className="space-y-4 leading-relaxed">
            <h2 className="text-lg font-semibold text-zinc-100">
              What you’re on
            </h2>
            <p>
              TornPage is a place to{" "}
              <strong className="font-medium text-zinc-200">read manga</strong>
              ,{" "}
              <strong className="font-medium text-zinc-200">
                find new series
              </strong>
              , and{" "}
              <strong className="font-medium text-zinc-200">
                put your own pages out there
              </strong>
              . The heart of it is{" "}
              <strong className="font-medium text-zinc-200">
                community-first
              </strong>
              : creators from across the world posting work here, with a reader
              that’s meant for long sessions—binge, bookmark, jump into
              comments—without feeling like you’re fighting the site.
            </p>
            <p>
              The{" "}
              <strong className="font-medium text-zinc-200">
                main thing here is the community shelf
              </strong>
              : uploads, custom picks, and chapters fans and friends are posting
              right now. That’s what this site is for—finding each other’s work
              and giving it a reader that feels good to stay in.
            </p>
            <p>
              It started as a friends-and-fans project: we wanted one shelf you
              actually want to hang out on, instead of tabs scattered everywhere.
              That’s still the vibe—just honest about what’s on it today.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Reading</h2>
            <ul className="list-inside list-disc space-y-2 marker:text-amber-500/80">
              <li>
                <strong className="font-medium text-zinc-200">Scroll</strong>{" "}
                or{" "}
                <strong className="font-medium text-zinc-200">book-style</strong>{" "}
                page turns—your call per session.
              </li>
              <li>
                <strong className="font-medium text-zinc-200">Comments</strong>{" "}
                on chapters, with reader profiles you can open from the thread.
              </li>
              <li>
                <strong className="font-medium text-zinc-200">
                  Saved &amp; recent
                </strong>{" "}
                live on the{" "}
                <Link href="/read" className="text-amber-300 hover:underline">
                  Read
                </Link>{" "}
                page so you can jump back in fast.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              Finding stuff
            </h2>
            <ul className="list-inside list-disc space-y-2 marker:text-amber-500/80">
              <li>
                <Link href="/browse" className="text-amber-300 hover:underline">
                  Browse
                </Link>{" "}
                the shelf we’re building—covers, genres, and community picks
                from people posting here.
              </li>
              <li>
                The header{" "}
                <strong className="font-medium text-zinc-200">search</strong>{" "}
                can target{" "}
                <strong className="font-medium text-zinc-200">series</strong>,{" "}
                <strong className="font-medium text-zinc-200">creators</strong>,
                or{" "}
                <strong className="font-medium text-zinc-200">
                  community profiles
                </strong>
                —use the ⋯ menu to switch scope.
              </li>
              <li>
                The home page surfaces staff-style picks, what’s heating up by
                genre, and a personalized rail when you’re signed in with a
                demo profile—geared to what’s on the site right now, with room
                to grow as the library does.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              Publishing &amp; art
            </h2>
            <ul className="list-inside list-disc space-y-2 marker:text-amber-500/80">
              <li>
                <Link href="/upload" className="text-amber-300 hover:underline">
                  Upload
                </Link>{" "}
                for pushing chapters and keeping a series alive.
              </li>
              <li>
                <Link
                  href="/manga-creator"
                  className="text-amber-300 hover:underline"
                >
                  Manga studio
                </Link>{" "}
                for sketching and panel work in the browser.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">Accounts</h2>
            <p className="leading-relaxed">
              You can try a lightweight sign-in from the profile menu: it
              stores a display name locally so you get avatars and profile links
              that match our demo community roster. It’s not a full auth
              product yet—just enough to click around like a real reader.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-lg font-semibold text-zinc-100">Talk to us</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Partnerships, bugs, wild ideas—{" "}
              <Link
                href="/contact"
                className="text-amber-300 underline-offset-2 hover:underline"
              >
                contact page
              </Link>{" "}
              has the vision line and phone number{" "}
              <span className="text-zinc-300">804-690-2365</span>.
            </p>
          </section>
        </div>

        <p className="mt-14 text-center text-sm text-zinc-500">
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            ← Home
          </Link>
        </p>
      </main>
    </div>
  );
}
