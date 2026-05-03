"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  searchByMode,
  type SearchMode,
  cardCoverPath,
} from "@/lib/siteSearch";
import type { MangaBrowseCard } from "@/lib/browseManga";
import { USER_PROFILES, profileHref } from "@/lib/userProfiles";
import {
  TORNPAGE_SESSION_KEY,
  type TornpageSession,
} from "@/lib/tornpageSession";

function useOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, handler]);
}

const MODE_LABEL: Record<SearchMode, string> = {
  manga: "Manga",
  creators: "Creators",
  users: "Users",
};

function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("manga");
  const [openPreview, setOpenPreview] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewBox, setPreviewBox] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewPortalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  const preview =
    query.trim().length > 0 ? searchByMode(mode, query, 6) : [];

  const updatePreviewBox = useCallback(() => {
    const el = wrapRef.current;
    if (!el || !openPreview || preview.length === 0) {
      setPreviewBox(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setPreviewBox({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 220),
    });
  }, [openPreview, preview.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    updatePreviewBox();
  }, [updatePreviewBox, query, mode]);

  useEffect(() => {
    if (!openPreview || preview.length === 0) return;
    window.addEventListener("resize", updatePreviewBox);
    window.addEventListener("scroll", updatePreviewBox, true);
    return () => {
      window.removeEventListener("resize", updatePreviewBox);
      window.removeEventListener("scroll", updatePreviewBox, true);
    };
  }, [openPreview, preview.length, updatePreviewBox]);

  useEffect(() => {
    if (!openPreview) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (previewPortalRef.current?.contains(t)) return;
      setOpenPreview(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openPreview]);

  const goSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;
    setOpenPreview(false);
    router.push(
      `/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`,
    );
  }, [query, mode, router]);

  const previewPanel =
    openPreview && preview.length > 0 && previewBox && mounted ? (
      <div
        ref={previewPortalRef}
        className="fixed z-[300] max-h-[min(20rem,calc(100vh-1rem))] overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950/98 shadow-2xl shadow-black/50 backdrop-blur-sm"
        style={{
          top: previewBox.top,
          left: previewBox.left,
          width: previewBox.width,
        }}
        role="listbox"
        aria-label="Search suggestions"
      >
        <ul className="py-1">
          {preview.map((hit, i) => (
            <li key={i}>
              <SearchPreviewRow hit={hit} onPick={() => setOpenPreview(false)} />
            </li>
          ))}
        </ul>
        <div className="border-t border-zinc-800 px-3 py-2 text-center">
          <button
            type="button"
            onClick={goSearch}
            className="text-xs font-medium text-amber-300 hover:text-amber-200"
          >
            See all results →
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div ref={wrapRef} className="relative z-20 min-w-0 flex-1">
      <div className="flex w-full items-center rounded-xl border border-zinc-700 bg-zinc-900/80 pr-1 shadow-inner focus-within:border-amber-600/50 focus-within:ring-1 focus-within:ring-amber-600/30">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMenuOpen(false);
            setOpenPreview(true);
          }}
          onFocus={() => {
            setMenuOpen(false);
            setOpenPreview(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goSearch();
            }
            if (e.key === "Escape") {
              setOpenPreview(false);
              setMenuOpen(false);
            }
          }}
          placeholder={`Search ${MODE_LABEL[mode].toLowerCase()}…`}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
          aria-label="Search"
        />
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() =>
              setMenuOpen((o) => {
                const next = !o;
                if (next) setOpenPreview(false);
                return next;
              })
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Search scope"
            title="Search scope"
          >
            <span className="text-lg leading-none">⋯</span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-[60] mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
              {(["manga", "creators", "users"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setMenuOpen(false);
                    if (query.trim().length > 0) setOpenPreview(true);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-sm ${
                    mode === m
                      ? "bg-amber-500/15 text-amber-200"
                      : "text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {MODE_LABEL[m]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {previewPanel ? createPortal(previewPanel, document.body) : null}
    </div>
  );
}

function SearchPreviewRow({
  hit,
  onPick,
}: {
  hit: ReturnType<typeof searchByMode>[number];
  onPick: () => void;
}) {
  if (hit.kind === "manga") {
    const card = hit.card as MangaBrowseCard;
    const href = hit.href ?? "/browse";
    const src = cardCoverPath(card);
    return (
      <Link
        href={href}
        onClick={onPick}
        className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/80"
      >
        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-zinc-800">
          <Image src={src} alt="" fill className="object-cover" sizes="36px" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-100">{card.title}</p>
          <p className="truncate text-xs text-zinc-500">{card.author}</p>
        </div>
      </Link>
    );
  }
  if (hit.kind === "creator") {
    const inner = (
      <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/80">
        <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-zinc-800 text-lg text-zinc-500">
          ✎
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-zinc-100">{hit.name}</p>
          <p className="truncate text-xs text-zinc-500">{hit.sampleTitle}</p>
        </div>
      </div>
    );
    return hit.href ? (
      <Link href={hit.href} onClick={onPick}>
        {inner}
      </Link>
    ) : (
      <Link href="/browse" onClick={onPick}>
        {inner}
      </Link>
    );
  }
  return (
    <Link
      href={hit.href}
      onClick={onPick}
      className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/80"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
        <Image
          src={hit.avatarSrc}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-100">{hit.username}</p>
        <p className="truncate text-xs text-zinc-500">{hit.bio}</p>
      </div>
    </Link>
  );
}

function NavBox({
  href,
  label,
  sub,
}: {
  href: string;
  label: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[5.5rem] flex-col rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-center transition hover:border-amber-600/40 hover:bg-zinc-800/80"
    >
      <span className="text-sm font-semibold text-zinc-100">{label}</span>
      {sub ? <span className="text-[10px] text-zinc-500">{sub}</span> : null}
    </Link>
  );
}

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<TornpageSession | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TORNPAGE_SESSION_KEY);
      if (!raw) {
        setSession(null);
        return;
      }
      const parsed = JSON.parse(raw) as TornpageSession;
      if (parsed?.username) setSession(parsed);
      else setSession(null);
    } catch {
      setSession(null);
    }
  }, []);

  const profile = session?.username
    ? USER_PROFILES[session.username]
    : undefined;
  const avatarSrc = profile?.avatarSrc ?? "/logo.png";
  const displayName = session?.username ?? "Guest";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-zinc-600 ring-2 ring-transparent transition hover:border-amber-500/50 hover:ring-amber-500/20"
        aria-label="Account menu"
        title={displayName}
      >
        <Image
          src={avatarSrc}
          alt=""
          fill
          className="object-cover"
          sizes="44px"
        />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-[60] mt-2 w-52 rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
          {!session ? (
            <>
              <p className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-500">
                Not signed in
              </p>
              <Link
                href="/signup"
                className="block px-3 py-2 text-sm text-amber-200 hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                Create account
              </Link>
            </>
          ) : (
            <>
              <p className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                {displayName}
              </p>
              {profile ? (
                <Link
                  href={profileHref(profile.username)}
                  className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                  onClick={() => setOpen(false)}
                >
                  Your profile
                </Link>
              ) : (
                <span className="block px-3 py-2 text-xs text-zinc-500">
                  Profile page unlocks with a demo username from signup.
                </span>
              )}
              <Link
                href="/settings"
                className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/read#saved"
                className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
                onClick={() => setOpen(false)}
              >
                Saved manga
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="relative z-30 overflow-visible border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl overflow-visible px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 overflow-visible lg:flex-row lg:items-start lg:gap-6">
          <Link href="/" className="shrink-0 lg:max-w-[200px]">
            <Image
              src="/tornpage-home-logo.png"
              alt="TornPage"
              width={160}
              height={56}
              className="h-12 w-auto object-contain object-left md:h-14"
              priority
            />
            <p className="mt-1 text-sm font-medium tracking-wide text-amber-200/90">
              Manga For Everyone.
            </p>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-visible">
            <div className="flex flex-col gap-3 overflow-visible sm:flex-row sm:items-center">
              <HeaderSearch />
              <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
                <NavBox href="/browse" label="Browse" sub="All titles" />
                <NavBox href="/read" label="Read" sub="Saved & recent" />
                <NavBox href="/upload" label="Upload" sub="Chapters" />
                <ProfileMenu />
              </div>
            </div>
            <nav className="flex flex-wrap gap-3 text-xs text-zinc-500">
              <Link href="/manga-creator" className="hover:text-amber-300">
                Create
              </Link>
              <Link href="/info" className="hover:text-amber-300">
                Info
              </Link>
              <Link href="/contact" className="hover:text-amber-300">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
