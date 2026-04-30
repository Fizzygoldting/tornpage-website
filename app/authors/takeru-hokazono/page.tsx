"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const works = [
  {
    title: "Kagurabachi",
    coverSrc: "/covers/Kagurabachi.jpg",
    type: "Ongoing series",
    views: "1.2M",
    likes: "486K",
  },
  {
    title: "Chain",
    coverSrc: "/authors/takeru-hokazono/chain.jpg",
    type: "One-shot",
    views: "412K",
    likes: "138K",
  },
  {
    title: "Roku no Meiyaku",
    coverSrc: "/authors/takeru-hokazono/roku-no-meiyaku.jpg",
    type: "One-shot",
    views: "367K",
    likes: "121K",
  },
];

export default function TakeruHokazonoProfilePage() {
  const [showAllStats, setShowAllStats] = useState(false);

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="torn-paper torn-tilt-left p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-amber-900/30 bg-amber-100/60">
              <Image
                src="/authors/takeru-hokazono/profile.webp"
                alt="Takeru Hokazono profile picture"
                fill
                className="object-cover"
                sizes="128px"
                priority
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-amber-950 md:text-4xl">
                Takeru Hokazono
              </h1>
              <p className="text-amber-950/80">
                Mangaka behind Kagurabachi and notable one-shots.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-amber-900/25 bg-amber-100/70 px-3 py-1 text-amber-950">
                  Followers: 128.4K
                </span>
                <span className="rounded-full border border-amber-900/25 bg-amber-100/70 px-3 py-1 text-amber-950">
                  Works: {works.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-zinc-100">Works</h2>
            <Link
              href="/browse"
              className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-300"
            >
              Back to browse
            </Link>
          </div>
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            onMouseLeave={() => setShowAllStats(false)}
          >
            {works.map((work) => (
              <article
                key={work.title}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg shadow-black/25 transition duration-200 hover:-translate-y-1 hover:border-amber-500/60"
                onMouseEnter={() => setShowAllStats(true)}
              >
                <div className="relative aspect-[3/4] w-full bg-zinc-800">
                  <Image
                    src={work.coverSrc}
                    alt={`${work.title} cover`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="space-y-1 p-4 text-zinc-100">
                  <h3 className="text-lg font-semibold">
                    {work.title}
                  </h3>
                  <p className="text-sm text-zinc-300">{work.type}</p>
                  <div
                    className={`overflow-hidden text-sm text-zinc-300 transition-all duration-200 ${
                      showAllStats
                        ? "mt-2 max-h-16 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p>Views: {work.views}</p>
                    <p>Likes: {work.likes}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
