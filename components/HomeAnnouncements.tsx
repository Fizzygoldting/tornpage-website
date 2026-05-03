"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type Slide = {
  /** Big uppercase channel name in the top bar */
  barSuffix: string;
  /** Tiny friendly subline under the bar (Wii manual energy) */
  barWhisper: string;
  kind: "video" | "text";
  title: string;
  description: string;
  /** Short italic tag above title on text slides */
  flavor?: string;
  cta?: { label: string; href: string };
};

const SLIDES: Slide[] = [
  {
    barSuffix: "Spotlight",
    barWhisper: "Channel 01 · hype department",
    kind: "video",
    title: "The good stuff goes here",
    description:
      "Trailer, founder hello, a killer manga panel blown up nice and big, or a twelve-second loop of a crow — if it gets people hyped to read, it belongs in this slot.",
  },
  {
    barSuffix: "Curators",
    barWhisper: "Channel 02 · humans with opinions",
    kind: "text",
    flavor: "Algorithms can wait in the hall.",
    title: "Picks we’ll defend in the group chat",
    description:
      "Real readers binge, argue, and come back with receipts. These are the titles we’re waving at you this week — no spreadsheet, just taste.",
    cta: { label: "Stroll the shelf with us →", href: "/browse" },
  },
  {
    barSuffix: "Reader",
    barWhisper: "Channel 03 · your couch, your laws",
    kind: "text",
    flavor: "Scroll gremlin or book purist?",
    title: "A reader that doesn’t judge",
    description:
      "Scroll like you’re on the train, or flip pages like you swiped the volume from a friend. Comments, saves, and weirdly satisfying panel flow — pick your poison.",
    cta: { label: "Resume the chaos →", href: "/read" },
  },
  {
    barSuffix: "Creators",
    barWhisper: "Channel 04 · ink-stained corner",
    kind: "text",
    flavor: "Yes, doodles count.",
    title: "Make the thing. Post the thing.",
    description:
      "Studio tools for panels, uploads for chapters, and that quiet hope someone leaves a comment nicer than “first.” We’re rooting for you.",
    cta: { label: "Bust out the manga cave →", href: "/manga-creator" },
  },
];

export function HomeAnnouncements() {
  const [index, setIndex] = useState(0);
  const n = SLIDES.length;
  const slide = SLIDES[index];

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + n) % n);
    },
    [n],
  );

  const [touchX, setTouchX] = useState<number | null>(null);

  return (
    <aside className="w-full max-w-[280px] justify-self-end lg:sticky lg:top-20 lg:self-start">
      <div className="wii-shop-channel text-zinc-100">
        <div className="wii-shop-channel__bar">
          <span className="wii-channel-gleam inline-block">TornPage</span>
          <span className="opacity-90"> · </span>
          <span>{slide.barSuffix}</span>
          <span className="wii-shop-channel__bar-line2">{slide.barWhisper}</span>
        </div>
        <div className="wii-shop-channel__body pb-2 pt-1">
          <div
            className="relative min-h-[218px] touch-pan-y"
            onTouchStart={(e) => setTouchX(e.targetTouches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX === null) return;
              const dx = e.changedTouches[0].clientX - touchX;
              setTouchX(null);
              if (dx > 56) go(-1);
              else if (dx < -56) go(1);
            }}
          >
            <p className="mb-1.5 text-center text-[9px] font-semibold tracking-wide text-zinc-500">
              Flip through channels ·{" "}
              <span className="text-amber-300/95">{index + 1}</span> / {n}
            </p>

            <div className="relative overflow-hidden rounded-sm border border-amber-900/30 bg-zinc-900/90">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  width: `${SLIDES.length * 100}%`,
                  transform: `translateX(-${(index * 100) / SLIDES.length}%)`,
                }}
              >
                {SLIDES.map((s, i) => (
                  <div
                    key={s.barSuffix}
                    style={{ width: `${100 / SLIDES.length}%` }}
                    className="shrink-0 px-2.5 pb-2.5 pt-2"
                    aria-hidden={i !== index}
                  >
                    {s.kind === "video" ? (
                      <div>
                        <div className="relative mb-2 flex items-center justify-between border-b border-amber-900/25 pb-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200/90">
                            Video booth
                          </span>
                          <span className="rounded-sm border border-amber-800/50 bg-zinc-950/80 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-amber-200/90">
                            TAP ▶
                          </span>
                        </div>
                        <div className="relative aspect-video overflow-hidden rounded-sm bg-zinc-900 ring-1 ring-amber-950/40">
                          <span className="wii-channel-ribbon">SOON</span>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-amber-600/60 bg-zinc-950 text-sm text-amber-200 transition hover:border-amber-500 hover:bg-zinc-900">
                              ▶
                            </span>
                            <p className="text-[11px] font-extrabold leading-tight text-zinc-50">
                              {s.title}
                            </p>
                            <p className="text-[10px] font-medium leading-snug text-zinc-400">
                              {s.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[198px] flex-col rounded-sm border border-amber-900/25 bg-zinc-950/75 px-3 py-3">
                        {s.flavor ? (
                          <p className="text-[10px] font-semibold italic text-amber-200/70">
                            {s.flavor}
                          </p>
                        ) : null}
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-400/85">
                          {s.barSuffix}
                        </p>
                        <p className="mt-1.5 text-[15px] font-extrabold leading-tight tracking-tight text-zinc-50">
                          {s.title}
                        </p>
                        <p className="mt-2 flex-1 text-[12px] leading-relaxed text-zinc-400">
                          {s.description}
                        </p>
                        {s.cta ? (
                          <Link
                            href={s.cta.href}
                            className="mt-3 inline-flex rounded-sm border border-amber-700/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-200/95 transition hover:border-amber-600/55 hover:bg-amber-500/15"
                          >
                            {s.cta.label}
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
              <button
                type="button"
                onClick={() => go(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-amber-900/40 bg-zinc-900 text-sm font-bold text-amber-200/90 transition hover:border-amber-700/50 hover:bg-zinc-800"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div
                className="flex flex-1 justify-center gap-1.5"
                role="tablist"
                aria-label="Channel slides"
              >
                {SLIDES.map((s, i) => (
                  <button
                    key={s.barSuffix}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${s.barSuffix}: ${s.title}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-sm transition-[width,background-color] duration-200 ${
                      i === index
                        ? "w-6 bg-amber-500"
                        : "w-1.5 bg-zinc-600 hover:bg-zinc-500"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-amber-900/40 bg-zinc-900 text-sm font-bold text-amber-200/90 transition hover:border-amber-700/50 hover:bg-zinc-800"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>

            <p className="mt-2 text-center text-[9px] font-medium leading-snug text-zinc-500">
              Swipe the card on your phone. We won’t tell your Wii.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
