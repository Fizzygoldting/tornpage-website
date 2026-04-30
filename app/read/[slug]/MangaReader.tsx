"use client";
/* eslint-disable @next/next/no-img-element -- reader pages: variable aspect ratio */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserProfile, profileCoverSrc, profileHref } from "@/lib/userProfiles";

type ReaderMode = "scroll" | "book" | "spread";

type Props = {
  title: string;
  pageSrcs: string[];
};

type ChapterComment = {
  username: string;
  avatarSrc: string;
  text: string;
  likes: number;
  timeAgo: string;
};

function readStoredNotes(key: string): { text: string; savedAt: string | null } {
  if (typeof window === "undefined") return { text: "", savedAt: null };
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return { text: "", savedAt: null };
    const parsed = JSON.parse(stored) as { text?: string; savedAt?: string };
    return {
      text: parsed.text ?? "",
      savedAt: parsed.savedAt ?? null,
    };
  } catch {
    return { text: "", savedAt: null };
  }
}

const SAMPLE_CHAPTER_COMMENTS: ChapterComment[] = [
  {
    username: "DenjiFan563",
    avatarSrc: "/comments/profiles/DenjiFan563.jpeg",
    text: "That spread on this chapter was insane. The pacing is getting better every release.",
    likes: 142,
    timeAgo: "2h ago",
  },
  {
    username: "FizzyGoldTing",
    avatarSrc: "/comments/profiles/FizzyGoldTing.jpg",
    text: "Love the panel flow here. The action is way easier to follow in book mode.",
    likes: 88,
    timeAgo: "4h ago",
  },
  {
    username: "KojimaIsThinking",
    avatarSrc: "/comments/profiles/KojimaIsThinking.jpeg",
    text: "Chapter cliffhanger is brutal. Need the next chapter right now.",
    likes: 201,
    timeAgo: "6h ago",
  },
  {
    username: "MyNameisEven",
    avatarSrc: "/comments/profiles/MyNameisEven.jpeg",
    text: "The background details on these pages are super clean.",
    likes: 57,
    timeAgo: "8h ago",
  },
  {
    username: "Stressedg3rl",
    avatarSrc: "/comments/profiles/Stressedg3rl.jpeg",
    text: "I switched to scroll mode for this chapter and it was such a smooth read.",
    likes: 64,
    timeAgo: "9h ago",
  },
  {
    username: "ThatNerd",
    avatarSrc: "/comments/profiles/ThatNerd.jpeg",
    text: "Can we appreciate that final panel composition? Absolute cinema.",
    likes: 129,
    timeAgo: "11h ago",
  },
  {
    username: "Yormaisbird",
    avatarSrc: "/comments/profiles/Yormaisbird.jpeg",
    text: "Great chapter. I keep coming back to this one to study the page turns.",
    likes: 73,
    timeAgo: "1d ago",
  },
];

export function MangaReader({ title, pageSrcs }: Props) {
  const notesStorageKey = `reader-notes:${title}`;
  const initialNotesState = useMemo(
    () => readStoredNotes(notesStorageKey),
    [notesStorageKey],
  );
  const [mode, setMode] = useState<ReaderMode>("scroll");
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notes, setNotes] = useState(initialNotesState.text);
  const [notesSavedAt, setNotesSavedAt] = useState<string | null>(
    initialNotesState.savedAt,
  );
  const [panelTab, setPanelTab] = useState<"settings" | "comments" | "extras">(
    "settings",
  );
  const [pinnedPreviewUsername, setPinnedPreviewUsername] = useState<string | null>(
    null,
  );
  const fullscreenRootRef = useRef<HTMLDivElement>(null);
  const readerStageRef = useRef<HTMLDivElement>(null);

  const total = pageSrcs.length;
  const clampedIndex = Math.min(Math.max(pageIndex, 0), total - 1);
  const spreadRightIndex =
    mode === "spread" ? Math.min(clampedIndex + 1, total - 1) : clampedIndex;
  const currentSpread = useMemo(
    () => [pageSrcs[clampedIndex], pageSrcs[spreadRightIndex]].filter(Boolean),
    [clampedIndex, pageSrcs, spreadRightIndex],
  );

  const pageStep = mode === "spread" ? 2 : 1;
  const imageMaxHeight = `${Math.round(80 * (zoom / 100))}vh`;
  const panelWidth = panelTab === "comments" ? "36rem" : "30rem";

  const goPrev = useCallback(() => {
    setPageIndex((i) => {
      const c = Math.min(Math.max(i, 0), total - 1);
      return Math.max(0, c - pageStep);
    });
  }, [pageStep, total]);

  const goNext = useCallback(() => {
    setPageIndex((i) => {
      const c = Math.min(Math.max(i, 0), total - 1);
      return Math.min(total - 1, c + pageStep);
    });
  }, [pageStep, total]);

  const toggleFullscreen = useCallback(async () => {
    if (!fullscreenRootRef.current) return;
    if (!document.fullscreenElement) {
      await fullscreenRootRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const setReaderMode = useCallback((nextMode: ReaderMode) => {
    setMode(nextMode);
    setPageIndex((i) => (nextMode === "spread" ? i - (i % 2) : i));
  }, []);

  useEffect(() => {
    if (mode === "scroll") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, mode]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const saveNotes = useCallback(() => {
    const savedAt = new Date().toISOString();
    const payload = { text: notes, savedAt };
    window.localStorage.setItem(notesStorageKey, JSON.stringify(payload));
    setNotesSavedAt(savedAt);
  }, [notes, notesStorageKey]);

  const handleProfileNameClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, username: string) => {
      if (typeof window === "undefined") return;
      const isTouchLikeDevice = window.matchMedia("(hover: none)").matches;
      if (!isTouchLikeDevice) return;
      event.preventDefault();
      setPinnedPreviewUsername((current) =>
        current === username ? null : username,
      );
    },
    [],
  );

  return (
    <div
      ref={fullscreenRootRef}
      className="paper-stage min-h-screen text-zinc-100"
      style={
        isFullscreen
          ? {
              overflowY: mode === "scroll" ? "auto" : undefined,
              overflowX: "hidden",
              backgroundColor: "#111014",
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(255, 180, 80, 0.12), transparent 40%), radial-gradient(circle at 80% 10%, rgba(255, 120, 70, 0.08), transparent 32%), linear-gradient(120deg, rgba(255, 255, 255, 0.035) 0%, transparent 35%), repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.018) 0px, rgba(255, 255, 255, 0.018) 1px, transparent 1px, transparent 6px)",
            }
          : undefined
      }
    >
      <header
        className={`${
          isFullscreen
            ? "hidden"
            : "sticky top-0 z-20 border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/read"
              className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"
            >
              Back
            </Link>
            <h1 className="truncate text-lg font-semibold text-zinc-50 md:text-xl">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2" />
        </div>
      </header>

      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={panelOpen ? "Close reader menu" : "Open reader menu"}
        className={`fixed z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg shadow-black/40 transition-all duration-300 ease-out active:scale-95 ${
          panelOpen
            ? `top-1/2 -translate-y-1/2`
            : "right-4 top-1/2 -translate-y-1/2"
        } ${
          panelOpen
            ? "border-amber-400/80 bg-zinc-900 text-amber-200 shadow-amber-500/20"
            : "border-zinc-600 bg-zinc-900/95 text-zinc-100 shadow-amber-400/25 hover:border-amber-500/70 hover:text-amber-100"
        }`}
        style={panelOpen ? { right: panelWidth } : undefined}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-5 w-5 text-amber-200 transition-transform duration-300 ${
            panelOpen ? "reader-book-page-flip scale-110" : "scale-100"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6c-2-1.6-4.3-2-7-2v13c2.7 0 5 .4 7 2" />
          <path d="M12 6c2-1.6 4.3-2 7-2v13c-2.7 0-5 .4-7 2" />
          <path d="M12 6v13" />
          <path
            d="M12.2 8.2c1.2-.8 2.6-1.2 4.2-1.3"
            className={panelOpen ? "opacity-100" : "opacity-0"}
          />
        </svg>
      </button>

      <div
        className={`transition-[margin,transform] duration-300 ${
          panelOpen ? "lg:mr-[30rem]" : ""
        }`}
        style={panelOpen ? { marginRight: panelWidth } : undefined}
      >
      {mode === "scroll" ? (
        <div
          className={`mx-auto grid max-w-7xl gap-6 px-3 md:px-4 ${
            isFullscreen ? "pb-4 pt-3" : "pb-24 pt-6"
          }`}
        >
          <div className="min-w-0">
          <p className="mb-6 text-center text-sm text-zinc-500">
            Scroll down through all pages.
          </p>
          <div className="space-y-2">
            {pageSrcs.map((src, i) => (
              <div key={src} className="flex w-full justify-center">
                <img
                  src={src}
                  alt={`${title} page ${i + 1}`}
                  className="block max-w-none select-none rounded-sm shadow-lg shadow-black/40"
                  style={{ width: `${zoom}%` }}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
          </div>
        </div>
      ) : (
        <div
          className={`mx-auto grid max-w-7xl gap-6 ${
            isFullscreen ? "px-0 pb-0 pt-0" : "px-3 pb-28 pt-6 md:px-6"
          }`}
        >
          <div className="min-w-0">
          <p className="mb-4 text-center text-sm text-zinc-500">
            Tap the left or right side of the page to turn back or forward, or use
            the buttons and arrow keys.
          </p>
          <div
            ref={readerStageRef}
            className={`relative flex min-h-[60vh] items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-inner shadow-black/30 md:min-h-[70vh] ${
              isFullscreen ? "h-[100dvh] w-full rounded-none border-none p-2" : ""
            }`}
          >
            <div className="pointer-events-none absolute inset-0 z-10 flex">
              <button
                type="button"
                aria-label="Previous page"
                disabled={clampedIndex <= 0}
                onClick={goPrev}
                className="pointer-events-auto h-full w-1/2 cursor-w-resize border-0 bg-transparent transition enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              />
              <button
                type="button"
                aria-label="Next page"
                disabled={clampedIndex >= total - 1}
                onClick={goNext}
                className="pointer-events-auto h-full w-1/2 cursor-e-resize border-0 bg-transparent transition enabled:hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
              />
            </div>
            <div
              key={clampedIndex}
              className="manga-reader-page-in pointer-events-none relative z-0 flex max-h-[80vh] w-full items-center justify-center"
            >
              {mode === "spread" ? (
                <div className="flex max-h-[80vh] w-full max-w-6xl items-center justify-center gap-2 md:gap-3">
                  {currentSpread.map((src, idx) => (
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt={`${title} page ${clampedIndex + idx + 1}`}
                      className="w-[48%] max-w-[48%] select-none rounded-sm object-contain shadow-2xl shadow-black/50"
                      style={{ maxHeight: imageMaxHeight }}
                      decoding="async"
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={pageSrcs[clampedIndex]}
                  alt={`${title} page ${clampedIndex + 1}`}
                  className="w-auto max-w-full select-none rounded-sm object-contain shadow-2xl shadow-black/50"
                  style={{ maxHeight: imageMaxHeight }}
                  decoding="async"
                />
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={clampedIndex <= 0}
              className="rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-100 transition enabled:hover:border-amber-500/50 enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={clampedIndex >= total - 1}
              className="rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-100 transition enabled:hover:border-amber-500/50 enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
          </div>
        </div>
      )}
      </div>

      <aside
        className={`fixed right-0 top-0 z-30 h-screen border-l border-zinc-800 bg-zinc-950/95 p-5 pt-20 shadow-2xl shadow-black/50 backdrop-blur will-change-transform transition-all duration-500 ease-out ${
          panelOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-[105%] opacity-0 pointer-events-none"
        }`}
        style={{ width: panelWidth }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-300">
          Menu
        </h2>
        {panelTab === "comments" ? (
          <div className="mt-4 flex h-[calc(100vh-8rem)] flex-col">
            <button
              type="button"
              onClick={() => setPanelTab("settings")}
              className="mb-3 w-fit rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-amber-500/60 hover:text-amber-200"
            >
              ← Back to menu
            </button>
            <div className="comments-panel-bounce flex-1 space-y-3 overflow-y-auto pr-0.5 animate-in fade-in duration-200">
              {SAMPLE_CHAPTER_COMMENTS.map((comment) => (
                <article key={comment.username} className="rounded-lg border border-zinc-700 bg-zinc-800/70 p-4">
                  <div className="flex items-start gap-3">
                    <Link
                      href={profileHref(comment.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full ring-2 ring-transparent transition hover:ring-amber-500/40"
                    >
                      <img src={comment.avatarSrc} alt="" className="h-9 w-9 rounded-full object-cover" loading="lazy" decoding="async" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      {(() => {
                        const commenterProfile = getUserProfile(comment.username);
                        const isPinned = pinnedPreviewUsername === comment.username;
                        return (
                      <div className="flex items-center justify-between gap-2">
                            <div className="relative inline-block group/profile">
                              <Link
                                href={profileHref(comment.username)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => handleProfileNameClick(event, comment.username)}
                                className="truncate text-sm font-semibold text-zinc-100 underline decoration-zinc-600 underline-offset-2 transition hover:text-amber-200 hover:decoration-amber-400/70"
                              >
                                {comment.username}
                              </Link>
                              {commenterProfile ? (
                                <div
                                  className={`absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-amber-500/30 bg-zinc-950/95 p-3 shadow-2xl shadow-black/60 transition-all duration-200 ${
                                    isPinned
                                      ? "pointer-events-auto visible translate-y-0 opacity-100"
                                      : "pointer-events-none invisible translate-y-1 opacity-0 group-hover/profile:pointer-events-auto group-hover/profile:visible group-hover/profile:translate-y-0 group-hover/profile:opacity-100"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={commenterProfile.avatarSrc}
                                      alt=""
                                      className="h-11 w-11 rounded-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-zinc-100">
                                        {commenterProfile.username}
                                      </p>
                                      <p className="text-xs text-zinc-400">
                                        Member since {commenterProfile.memberSince}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs text-zinc-300">
                                    {commenterProfile.bio}
                                  </p>
                                  <div className="mt-3 flex gap-2">
                                    {commenterProfile.favorites.slice(0, 3).map((fav) => (
                                      <div
                                        key={fav.title}
                                        className="relative h-14 w-10 overflow-hidden rounded border border-zinc-700 bg-zinc-900"
                                      >
                                        <img
                                          src={profileCoverSrc(fav)}
                                          alt=""
                                          className="h-full w-full object-cover"
                                          loading="lazy"
                                          decoding="async"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <Link
                                    href={profileHref(comment.username)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"
                                  >
                                    Open full profile
                                  </Link>
                                </div>
                              ) : null}
                            </div>
                        <span className="text-xs text-zinc-500">{comment.timeAgo}</span>
                      </div>
                        );
                      })()}
                      <p className="mt-1 text-sm text-zinc-300">{comment.text}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          aria-label={`Like ${comment.username}'s comment`}
                          className="inline-flex items-center gap-1 rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-200"
                        >
                          <span aria-hidden>♥</span>
                          <span>{comment.likes}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-zinc-600 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <>
        <div className="mt-4 border-t border-zinc-800 pt-3">
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setPanelTab("settings")}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition active:scale-95 ${
              panelTab === "settings"
                ? "border-amber-500/40 bg-amber-500/20 text-amber-200 shadow-inner shadow-amber-500/20"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            ⚙ Settings
          </button>
          {panelTab === "settings" ? (
            <div className="comments-panel-bounce rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 animate-in fade-in duration-200">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Quick Controls
              </p>
              <div className="mb-3">
                <p className="mb-1 text-xs text-zinc-500">Mode</p>
                <div className="grid grid-cols-3 gap-1">
                  <button type="button" onClick={() => setReaderMode("scroll")} className={`rounded px-2 py-1 text-xs ${mode === "scroll" ? "bg-amber-500/20 text-amber-200" : "bg-zinc-800 text-zinc-300"}`}>Scroll</button>
                  <button type="button" onClick={() => setReaderMode("book")} className={`rounded px-2 py-1 text-xs ${mode === "book" ? "bg-amber-500/20 text-amber-200" : "bg-zinc-800 text-zinc-300"}`}>Book</button>
                  <button type="button" onClick={() => setReaderMode("spread")} className={`rounded px-2 py-1 text-xs ${mode === "spread" ? "bg-amber-500/20 text-amber-200" : "bg-zinc-800 text-zinc-300"}`}>Spread</button>
                </div>
              </div>
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>Zoom</span>
                  <span>{zoom}%</span>
                </div>
                <input type="range" min={60} max={150} step={5} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </div>
              <button type="button" onClick={toggleFullscreen} className="w-full rounded bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 transition hover:bg-zinc-700">
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setPanelTab("comments")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-95"
          >
            💬 Comments
          </button>
          <button
            type="button"
            onClick={() => setPanelTab("extras")}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition active:scale-95 ${
              panelTab === "extras"
                ? "border-amber-500/40 bg-amber-500/20 text-amber-200 shadow-inner shadow-amber-500/20"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            ✨ Extras
          </button>
        </div>
        </div>
        <div className="mt-4 h-[calc(100vh-13.5rem)] overflow-y-auto pr-0.5">
        {panelTab === "settings" ? (
          <div className="comments-panel-bounce animate-in fade-in duration-200">
            <p className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs text-zinc-400">Settings loaded.</p>
          </div>
        ) : null}
        {panelTab === "extras" ? (
          <div className="comments-panel-bounce space-y-3 rounded-lg border border-zinc-700 bg-zinc-800/70 p-3 text-sm text-zinc-300 animate-in fade-in duration-200">
            <h3 className="text-sm font-semibold text-zinc-100">Chapter Notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Write your notes about this chapter..." className="w-full resize-y rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40" />
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={saveNotes} className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-amber-300 active:scale-95">Save Notes</button>
              <span className="text-xs text-zinc-500">{notesSavedAt ? `Saved ${new Date(notesSavedAt).toLocaleString()}` : "Not saved yet"}</span>
            </div>
            <p className="text-xs text-zinc-500">Notes are currently saved locally. When profiles are added, this can be switched to save per user account.</p>
            <p className="text-xs text-zinc-500">More reader tools can be added here too (bookmarks, chapter list, reading goals).</p>
          </div>
        ) : null}
        </div>
          </>
        )}
      </aside>
    </div>
  );
}
