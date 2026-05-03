"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  searchByMode,
  type SearchMode,
  cardCoverPath,
} from "@/lib/siteSearch";
import type { MangaBrowseCard } from "@/lib/browseManga";

function modeFromParam(s: string | null): SearchMode {
  const v = (s ?? "").trim().toLowerCase();
  if (v === "creators" || v === "creator") return "creators";
  if (v === "users" || v === "user") return "users";
  return "manga";
}

const SCOPE_TABS: { mode: SearchMode; label: string }[] = [
  { mode: "manga", label: "Manga" },
  { mode: "creators", label: "Creators" },
  { mode: "users", label: "Users" },
];

export default function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const mode = modeFromParam(params.get("mode"));

  const results = useMemo(() => searchByMode(mode, q, 50), [mode, q]);

  function setScope(next: SearchMode) {
    const p = new URLSearchParams(params.toString());
    p.set("mode", next);
    router.push(`/search?${p.toString()}`);
  }

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <h1 className="text-3xl font-bold text-zinc-50">Search</h1>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Search scope"
        >
          {SCOPE_TABS.map(({ mode: m, label }) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setScope(m)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                mode === m
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                  : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          {q ? (
            <>
              Results for “{q}” ·{" "}
              <span className="text-amber-200/90">
                {mode === "manga"
                  ? "Manga"
                  : mode === "creators"
                    ? "Creators"
                    : "Users"}
              </span>
            </>
          ) : (
            "Enter a search from the header to see results here."
          )}
        </p>

        {!q ? null : results.length === 0 ? (
          <p className="mt-10 text-zinc-500">No matches. Try another word.</p>
        ) : (
          <ul className="mt-8 space-y-2">
            {results.map((hit, i) => (
              <li
                key={i}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60"
              >
                {hit.kind === "manga" ? (
                  <Link
                    href={hit.href ?? "/browse"}
                    className="flex items-center gap-4 p-3 hover:bg-zinc-800/60"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      <Image
                        src={cardCoverPath(hit.card as MangaBrowseCard)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        {(hit.card as MangaBrowseCard).title}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {(hit.card as MangaBrowseCard).author} ·{" "}
                        {(hit.card as MangaBrowseCard).genre}
                      </p>
                    </div>
                  </Link>
                ) : hit.kind === "creator" ? (
                  <Link
                    href={hit.href ?? "/browse"}
                    className="flex items-center gap-4 p-3 hover:bg-zinc-800/60"
                  >
                    <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xl text-zinc-500">
                      ✎
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{hit.name}</p>
                      <p className="text-sm text-zinc-500">
                        Known for {hit.sampleTitle}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href={hit.href}
                    className="flex items-center gap-4 p-3 hover:bg-zinc-800/60"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                      <Image
                        src={hit.avatarSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        {hit.username}
                      </p>
                      <p className="line-clamp-2 text-sm text-zinc-500">
                        {hit.bio}
                      </p>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            ← Back home
          </Link>
        </p>
      </main>
    </div>
  );
}
