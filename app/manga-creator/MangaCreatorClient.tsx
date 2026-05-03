"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MangaStudio } from "./MangaStudio";

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function MangaCreatorClient({ gateAside }: { gateAside: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [studioMounted, setStudioMounted] = useState(false);
  const [fsActive, setFsActive] = useState(false);

  useEffect(() => {
    const sync = () => {
      const el = shellRef.current;
      setFsActive(!!el && getFullscreenElement() === el);
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [studioMounted]);

  useLayoutEffect(() => {
    if (!studioMounted) return;
    const el = shellRef.current;
    if (!el) return;
    if (getFullscreenElement() === el) return;
    const p = el.requestFullscreen?.();
    if (p && typeof (p as Promise<void>).catch === "function") {
      void (p as Promise<void>).catch(() => {
        const wk = el as HTMLElement & {
          webkitRequestFullscreen?: () => void;
        };
        wk.webkitRequestFullscreen?.();
      });
    } else {
      const wk = el as HTMLElement & {
        webkitRequestFullscreen?: () => void;
      };
      wk.webkitRequestFullscreen?.();
    }
  }, [studioMounted]);

  const reenterFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (el.requestFullscreen) void el.requestFullscreen().catch(() => {});
    else {
      const wk = el as HTMLElement & {
        webkitRequestFullscreen?: () => void;
      };
      wk.webkitRequestFullscreen?.();
    }
  }, []);

  const enterStudio = useCallback(() => {
    if (studioMounted) {
      reenterFullscreen();
      return;
    }
    setStudioMounted(true);
  }, [studioMounted, reenterFullscreen]);

  const exitStudio = useCallback(async () => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else await doc.webkitExitFullscreen?.();
    } catch {
      /* noop */
    }
    setFsActive(false);
  }, []);

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <div className="space-y-8">{gateAside}</div>
        <div className="flex min-h-[min(420px,70dvh)] flex-col justify-center gap-6 rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-8 shadow-xl shadow-black/30">
          <div>
            <h2 className="text-2xl font-bold text-amber-300">Drawing studio</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Enter fullscreen to use the fixed art-app layout: menu across the
              top, tools on the left, canvas in the center. Esc leaves fullscreen
              (your pages stay until you close the tab).
            </p>
          </div>
          <button
            type="button"
            onClick={enterStudio}
            className="rounded-xl bg-amber-400 px-6 py-3 text-base font-semibold text-zinc-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300"
          >
            {studioMounted ? "Re-enter fullscreen studio" : "Enter fullscreen studio"}
          </button>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href="/upload"
              className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Back to upload
            </Link>
            {studioMounted && !fsActive ? (
              <button
                type="button"
                onClick={reenterFullscreen}
                className="text-amber-300/90 underline-offset-2 hover:underline"
              >
                Return to fullscreen
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {studioMounted ? (
        <div
          ref={shellRef}
          className={
            fsActive
              ? "fixed inset-0 z-[200] flex min-h-0 flex-col bg-[#161618]"
              : "pointer-events-none invisible fixed inset-0 z-[200] flex min-h-0 flex-col opacity-0"
          }
          aria-hidden={!fsActive}
        >
          <MangaStudio immersive onExitStudio={() => void exitStudio()} />
        </div>
      ) : null}
    </>
  );
}
