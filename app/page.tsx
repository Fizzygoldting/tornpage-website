import Link from "next/link";
import { HomeAnnouncements } from "@/components/HomeAnnouncements";
import { HomeDiscoverSections } from "@/components/HomeDiscoverSections";
import {
  staffWeeklyPicks,
  popularByGenreSpotlight,
} from "@/lib/homeCatalog";

export default function Home() {
  const staff = staffWeeklyPicks();
  const popular = popularByGenreSpotlight();

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-3 md:px-6 md:pt-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start lg:gap-x-8 lg:gap-y-0">
          <div className="min-w-0 space-y-14 lg:pt-1">
            <HomeDiscoverSections staff={staff} popular={popular} />

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-zinc-100">
                Browse everything
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                The browse page is the deep dive: genres, filters, and the full
                catalog. We’ll refresh that layout next — jump in anytime.
              </p>
              <Link
                href="/browse"
                className="mt-5 inline-flex rounded-xl bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-white"
              >
                Open browse →
              </Link>
            </section>
          </div>

          <HomeAnnouncements />
        </div>
      </main>
    </div>
  );
}
