"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomeMangaItem } from "@/lib/homeCatalog";
import { personalizedShelf } from "@/lib/homeCatalog";
import { cardCoverPath } from "@/lib/siteSearch";
import {
  TORNPAGE_SESSION_KEY,
  type TornpageSession,
} from "@/lib/tornpageSession";

function MangaRail({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: HomeMangaItem[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 md:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ card, href }) => {
          const src = cardCoverPath(card);
          const target = href ?? "/browse";
          return (
            <Link
              key={card.title + src}
              href={target}
              className="group w-36 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition hover:border-amber-600/35 hover:shadow-lg hover:shadow-amber-900/10"
            >
              <div className="relative aspect-[3/4] w-full bg-zinc-800">
                <Image
                  src={src}
                  alt={card.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="144px"
                />
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                  {card.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{card.genre}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function HomeDiscoverSections({
  staff,
  popular,
}: {
  staff: HomeMangaItem[];
  popular: HomeMangaItem[];
}) {
  const [personalized, setPersonalized] = useState<HomeMangaItem[]>(() =>
    personalizedShelf(null),
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TORNPAGE_SESSION_KEY);
      let username: string | null = null;
      if (raw) {
        const s = JSON.parse(raw) as TornpageSession;
        if (s?.username) username = s.username;
      }
      setPersonalized(personalizedShelf(username));
    } catch {
      setPersonalized(personalizedShelf(null));
    }
  }, []);

  return (
    <div className="space-y-12">
      <MangaRail
        title="Recommended by us"
        subtitle="Our picks for the week — staff curated."
        items={staff}
      />
      <MangaRail
        title="Popular right now"
        subtitle="Heating up across genres."
        items={popular}
      />
      <MangaRail
        title="Picked for you"
        subtitle="Personalized when you’re signed in; a starter mix otherwise."
        items={personalized}
      />
    </div>
  );
}
