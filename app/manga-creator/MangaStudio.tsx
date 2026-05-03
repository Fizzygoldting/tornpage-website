"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import {
  MANGA_BRUSH_CONFIG,
  MANGA_BRUSH_ORDER,
  type MangaBrushPreset,
  resolveStrokeStyle,
} from "./mangaBrushes";
import {
  PANEL_TEMPLATE_OPTIONS,
  PanelTemplateGuideGroup,
  type PanelTemplateId,
} from "./panelTemplates";
import {
  deleteMangaDraft,
  listDraftsForUser,
  readSessionUsername,
  saveMangaDraft,
} from "@/lib/mangaDraftStorage";
import {
  MANGA_B4_TRIM_MM,
  MANGA_LIVE_AREA_MM,
  MANGA_PAGE_PIXEL_HEIGHT,
  MANGA_PAGE_PIXEL_WIDTH,
  MANGA_PX_PER_MM,
} from "./mangaPageDimensions";

/** Full ImageData undo steps at 4K are large; keep a small cap to avoid OOM. */
const MAX_CANVAS_UNDO_STEPS = 5;

type Point = { x: number; y: number };

function getPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Point {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * sx,
    y: (clientY - rect.top) * sy,
  };
}

function cloneImageData(src: ImageData): ImageData {
  const copy = new ImageData(src.width, src.height);
  copy.data.set(src.data);
  return copy;
}

function cloneImageDataStack(stack: ImageData[]): ImageData[] {
  return stack.map(cloneImageData);
}

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export type MangaStudioProps = {
  /** Full-viewport art-app layout; parent should own browser fullscreen. */
  immersive?: boolean;
  /** Leave fullscreen workspace (parent exits Fullscreen API). */
  onExitStudio?: () => void;
};

export function MangaStudio({
  immersive = false,
  onExitStudio,
}: MangaStudioProps) {
  const studioRootRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** Custom crosshair (pen/tablet often hides the OS cursor after capture). */
  const brushHairRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<Point | null>(null);
  const history = useRef<ImageData[]>([]);
  const redoHistory = useRef<ImageData[]>([]);
  const [color, setColor] = useState("#1a1a1a");
  const [brush, setBrush] = useState(3);
  const [brushPreset, setBrushPreset] = useState<MangaBrushPreset>("g-pen");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [twoPageView, setTwoPageView] = useState(false);
  /** View scale: 1 = sheet shown at native 3840×… CSS px (scroll/zoom workspace). */
  const [zoom, setZoom] = useState(0.42);
  const [panelTemplate, setPanelTemplate] = useState<PanelTemplateId>("off");
  const [historyDepth, setHistoryDepth] = useState(0);
  const [redoDepth, setRedoDepth] = useState(0);
  const [pages, setPages] = useState<string[]>([""]);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftTitleInput, setDraftTitleInput] = useState("");
  const [accountUsername, setAccountUsername] = useState<string | null>(null);
  const [draftAccountTick, setDraftAccountTick] = useState(0);
  const [draftToast, setDraftToast] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);
  /** Undo/redo stacks keyed by page index so Ctrl+Z works after switching back. */
  const pageHistoryStore = useRef<
    Record<number, { undo: ImageData[]; redo: ImageData[] }>
  >({});
  const prevPageIndexRef = useRef(-1);

  const resetHistory = useCallback(() => {
    history.current = [];
    redoHistory.current = [];
    setHistoryDepth(0);
    setRedoDepth(0);
  }, []);

  const positionBrushHair = useCallback((clientX: number, clientY: number) => {
    const wrap = wrapRef.current;
    const hair = brushHairRef.current;
    if (!wrap || !hair) return;
    const r = wrap.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    if (x < -4 || y < -4 || x > r.width + 4 || y > r.height + 4) {
      hair.style.visibility = "hidden";
      return;
    }
    hair.style.visibility = "visible";
    hair.style.left = `${x}px`;
    hair.style.top = `${y}px`;
  }, []);

  const hideBrushHair = useCallback(() => {
    const hair = brushHairRef.current;
    if (hair) hair.style.visibility = "hidden";
  }, []);

  const fillBlankPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const loadPageData = useCallback(
    (pageData: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (!pageData) {
        fillBlankPage();
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const image = new Image();
      image.onload = () => {
        fillBlankPage();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = pageData;
    },
    [fillBlankPage],
  );

  const saveCurrentPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = dataUrl;
      return next;
    });
  }, [currentPage]);

  const recordSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    while (history.current.length > MAX_CANVAS_UNDO_STEPS) {
      history.current.shift();
    }
    redoHistory.current = [];
    setHistoryDepth(history.current.length);
    setRedoDepth(0);
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const previous = history.current.pop();
    if (!previous) return;
    redoHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(previous, 0, 0);
    setHistoryDepth(history.current.length);
    setRedoDepth(redoHistory.current.length);
    const dataUrl = canvas.toDataURL("image/png");
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = dataUrl;
      return next;
    });
  }, [currentPage]);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoHistory.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const next = redoHistory.current.pop();
    if (!next) return;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(next, 0, 0);
    setHistoryDepth(history.current.length);
    setRedoDepth(redoHistory.current.length);
    const dataUrl = canvas.toDataURL("image/png");
    setPages((prev) => {
      const next = [...prev];
      next[currentPage] = dataUrl;
      return next;
    });
  }, [currentPage]);

  const syncDisplaySize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const zw = MANGA_PAGE_PIXEL_WIDTH * zoom;
    const zh = MANGA_PAGE_PIXEL_HEIGHT * zoom;
    canvas.style.width = `${zw}px`;
    canvas.style.height = `${zh}px`;
    wrap.style.width = `${zw}px`;
    wrap.style.height = `${zh}px`;
  }, [zoom]);

  const ensureFixedBitmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    if (
      canvas.width === MANGA_PAGE_PIXEL_WIDTH &&
      canvas.height === MANGA_PAGE_PIXEL_HEIGHT
    ) {
      return false;
    }
    const previousData =
      canvas.width > 0 && canvas.height > 0 ? canvas.toDataURL("image/png") : "";
    canvas.width = MANGA_PAGE_PIXEL_WIDTH;
    canvas.height = MANGA_PAGE_PIXEL_HEIGHT;
    if (previousData) {
      loadPageData(previousData);
    } else {
      fillBlankPage();
    }
    resetHistory();
    return true;
  }, [fillBlankPage, loadPageData, resetHistory]);

  useEffect(() => {
    ensureFixedBitmap();
    syncDisplaySize();
  }, [ensureFixedBitmap, syncDisplaySize]);

  useEffect(() => {
    const syncFullscreen = () => {
      const root = studioRootRef.current;
      setIsFullscreen(!!root && getFullscreenElement() === root);
      requestAnimationFrame(() => syncDisplaySize());
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, [syncDisplaySize]);

  const toggleFullscreen = useCallback(async () => {
    const el = studioRootRef.current;
    if (!el) return;
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const elWebkit = el as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (getFullscreenElement() === el) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else await doc.webkitExitFullscreen?.();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else {
        await elWebkit.webkitRequestFullscreen?.();
      }
    } catch {
      /* user denied or API unsupported */
    }
  }, []);

  useEffect(() => {
    if (prevPageIndexRef.current === currentPage) return;

    if (prevPageIndexRef.current >= 0) {
      pageHistoryStore.current[prevPageIndexRef.current] = {
        undo: cloneImageDataStack(history.current).slice(-MAX_CANVAS_UNDO_STEPS),
        redo: cloneImageDataStack(redoHistory.current).slice(-MAX_CANVAS_UNDO_STEPS),
      };
    }

    loadPageData(pages[currentPage] ?? "");

    const stored = pageHistoryStore.current[currentPage];
    if (stored) {
      history.current = cloneImageDataStack(stored.undo).slice(
        -MAX_CANVAS_UNDO_STEPS,
      );
      redoHistory.current = cloneImageDataStack(stored.redo).slice(
        -MAX_CANVAS_UNDO_STEPS,
      );
    } else {
      history.current = [];
      redoHistory.current = [];
    }
    setHistoryDepth(history.current.length);
    setRedoDepth(redoHistory.current.length);

    prevPageIndexRef.current = currentPage;
  }, [currentPage, loadPageData, pages]);

  useEffect(() => {
    const blockSelectWhileDrawing = (e: Event) => {
      if (drawing.current) e.preventDefault();
    };
    document.addEventListener("selectstart", blockSelectWhileDrawing, {
      capture: true,
    });
    return () =>
      document.removeEventListener("selectstart", blockSelectWhileDrawing, {
        capture: true,
      });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTypingField) return;

      const wantsUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
      const wantsRedoMac = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z";
      const wantsRedoWin = event.ctrlKey && event.key.toLowerCase() === "y";

      if (wantsRedoMac || wantsRedoWin) {
        event.preventDefault();
        redo();
        return;
      }

      if (wantsUndo) {
        event.preventDefault();
        undo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  const line = useCallback(
    (from: Point, to: Point) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const cfg = MANGA_BRUSH_CONFIG[brushPreset];
      const baseStroke = brush * cfg.widthMult * (MANGA_PX_PER_MM / 6);
      const lineWidth = Math.min(220, Math.max(0.5, baseStroke));
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = cfg.alpha;
      ctx.globalCompositeOperation = cfg.composite;
      ctx.strokeStyle = resolveStrokeStyle(brushPreset, color);
      ctx.lineWidth = lineWidth;
      ctx.lineCap = cfg.lineCap;
      ctx.lineJoin = cfg.lineJoin;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
    },
    [brush, brushPreset, color],
  );

  const start = (p: Point) => {
    recordSnapshot();
    drawing.current = true;
    last.current = p;
  };

  const move = (p: Point) => {
    if (!drawing.current || !last.current) return;
    line(last.current, p);
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
    saveCurrentPage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    recordSnapshot();
    fillBlankPage();
    saveCurrentPage();
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `tornpage-page-${currentPage + 1}.png`;
    a.click();
  };

  const goToPage = (index: number) => {
    saveCurrentPage();
    const clamped = Math.max(0, Math.min(index, pages.length - 1));
    setCurrentPage(clamped);
  };

  const createNextPage = () => {
    saveCurrentPage();
    setPages((prev) => {
      const next = [...prev, ""];
      setCurrentPage(next.length - 1);
      return next;
    });
  };

  useEffect(() => {
    const sync = () => setAccountUsername(readSessionUsername());
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [draftAccountTick]);

  useEffect(() => {
    if (!draftToast) return;
    const t = window.setTimeout(() => setDraftToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [draftToast]);

  const buildPagesSnapshot = useCallback((): string[] => {
    const canvas = canvasRef.current;
    const snap = [...pages];
    if (canvas && canvas.width > 0 && canvas.height > 0) {
      try {
        snap[currentPage] = canvas.toDataURL("image/png");
      } catch {
        /* keep cell */
      }
    }
    return snap.length ? snap : [""];
  }, [pages, currentPage]);

  const saveDraftToAccount = useCallback(() => {
    const u = readSessionUsername();
    if (!u) {
      setDraftToast({
        kind: "err",
        msg: "Sign in first to save drafts on this device.",
      });
      return;
    }
    const snap = buildPagesSnapshot();
    const r = saveMangaDraft({
      username: u,
      id: activeDraftId,
      nameInput: draftTitleInput,
      pages: snap,
    });
    if (!r.ok) {
      setDraftToast({ kind: "err", msg: r.error });
      return;
    }
    const wasUpdate = !!activeDraftId;
    pageHistoryStore.current = {};
    prevPageIndexRef.current = -1;
    setActiveDraftId(r.draft.id);
    setDraftTitleInput(r.draft.name);
    setPages(r.draft.pages);
    setCurrentPage((c) =>
      Math.min(c, Math.max(0, r.draft.pages.length - 1)),
    );
    setDraftAccountTick((x) => x + 1);
    setDraftToast({
      kind: "ok",
      msg: wasUpdate
        ? "Draft updated in your account."
        : "Draft saved to your account.",
    });
  }, [activeDraftId, buildPagesSnapshot, draftTitleInput]);

  const loadDraftById = useCallback((id: string) => {
    const u = readSessionUsername();
    if (!u) return;
    const d = listDraftsForUser(u).find((x) => x.id === id);
    if (!d) return;
    pageHistoryStore.current = {};
    prevPageIndexRef.current = -1;
    setActiveDraftId(d.id);
    setDraftTitleInput(d.name);
    setPages(d.pages.length ? [...d.pages] : [""]);
    setCurrentPage(0);
    setDraftToast({ kind: "ok", msg: `Opened “${d.name}”.` });
  }, []);

  const deleteDraftById = useCallback(
    (id: string) => {
      const u = readSessionUsername();
      if (!u) return;
      if (!window.confirm("Delete this draft from your account on this device?"))
        return;
      deleteMangaDraft(u, id);
      if (activeDraftId === id) {
        setActiveDraftId(null);
        setDraftTitleInput("");
      }
      setDraftAccountTick((x) => x + 1);
      setDraftToast({ kind: "ok", msg: "Draft removed." });
    },
    [activeDraftId],
  );

  const saveNewDraftCopy = useCallback(() => {
    const u = readSessionUsername();
    if (!u) {
      setDraftToast({
        kind: "err",
        msg: "Sign in first to save drafts on this device.",
      });
      return;
    }
    const snap = buildPagesSnapshot();
    const r = saveMangaDraft({
      username: u,
      nameInput: draftTitleInput,
      pages: snap,
    });
    if (!r.ok) {
      setDraftToast({ kind: "err", msg: r.error });
      return;
    }
    pageHistoryStore.current = {};
    prevPageIndexRef.current = -1;
    setActiveDraftId(r.draft.id);
    setDraftTitleInput(r.draft.name);
    setPages(r.draft.pages);
    setCurrentPage((c) =>
      Math.min(c, Math.max(0, r.draft.pages.length - 1)),
    );
    setDraftAccountTick((x) => x + 1);
    setDraftToast({ kind: "ok", msg: "Saved as a new draft." });
  }, [buildPagesSnapshot, draftTitleInput]);

  const startNewBlankDraft = useCallback(() => {
    if (
      !window.confirm(
        "Start a new blank draft? Save first if you need this work—canvas will reset.",
      )
    ) {
      return;
    }
    pageHistoryStore.current = {};
    prevPageIndexRef.current = -1;
    setActiveDraftId(null);
    setDraftTitleInput("");
    setPages([""]);
    setCurrentPage(0);
    resetHistory();
    setDraftAccountTick((x) => x + 1);
  }, [resetHistory]);

  const handleStageWheel = useCallback((e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom((z) => {
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const next = z * factor;
      return Math.min(2.5, Math.max(0.08, next));
    });
  }, []);

  const myDrafts = accountUsername
    ? listDraftsForUser(accountUsername)
    : [];

  function renderAccountDrafts(compact: boolean) {
    const t = compact ? "text-[10px]" : "text-xs";
    const btn = compact
      ? "rounded border border-zinc-600 px-2 py-1 text-[11px]"
      : "rounded-md border border-zinc-600 px-3 py-1.5 text-xs";
    if (!accountUsername) {
      return (
        <div className={compact ? "mt-2 space-y-2 border-t border-zinc-800 pt-3" : "mt-4 space-y-2 border-t border-zinc-600/40 pt-4"}>
          <p className={`${t} text-zinc-500`}>
            Sign in to save manga drafts on this browser (linked to your display
            name).
          </p>
          <Link
            href="/signup"
            className="inline-block text-[11px] font-medium text-amber-400 hover:text-amber-300"
          >
            Create account
          </Link>
        </div>
      );
    }
    return (
      <div
        className={
          compact
            ? "mt-2 space-y-3 border-t border-zinc-800 pt-3"
            : "mt-4 space-y-3 border-t border-zinc-600/40 pt-4"
        }
      >
        <p className={`${t} font-semibold uppercase tracking-wide text-zinc-500`}>
          Account drafts
        </p>
        <label className={`flex flex-col gap-1 ${t} text-zinc-400`}>
          <span className="text-zinc-500">Title (optional)</span>
          <input
            type="text"
            value={draftTitleInput}
            onChange={(e) => setDraftTitleInput(e.target.value)}
            placeholder={
              activeDraftId ? "Rename or leave as-is" : "Leave blank for Draft, Draft 1…"
            }
            className="rounded border border-zinc-600 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveDraftToAccount}
            className={`${btn} border-amber-500/50 bg-amber-500/20 font-medium text-amber-100 hover:bg-amber-500/30`}
          >
            {activeDraftId ? "Save" : "Save draft"}
          </button>
          {activeDraftId ? (
            <button
              type="button"
              onClick={saveNewDraftCopy}
              className={`${btn} text-zinc-200 hover:bg-zinc-800`}
            >
              Save as new
            </button>
          ) : null}
          <button
            type="button"
            onClick={startNewBlankDraft}
            className={`${btn} text-zinc-400 hover:bg-zinc-800`}
          >
            New blank
          </button>
        </div>
        {draftToast ? (
          <p
            className={`${t} ${draftToast.kind === "ok" ? "text-emerald-400/90" : "text-red-400/90"}`}
          >
            {draftToast.msg}
          </p>
        ) : null}
        <label className={`flex flex-col gap-1 ${t} text-zinc-400`}>
          <span className="text-zinc-500">Open a saved draft</span>
          <select
            className="rounded border border-zinc-600 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
            value=""
            onChange={(e) => {
              const id = e.target.value;
              e.target.value = "";
              if (id) loadDraftById(id);
            }}
          >
            <option value="">Choose…</option>
            {myDrafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.pages.length} pg)
              </option>
            ))}
          </select>
        </label>
        {myDrafts.length ? (
          <ul
            className={`max-h-40 space-y-1 overflow-y-auto ${compact ? "text-[11px]" : "text-xs"} text-zinc-400`}
          >
            {myDrafts.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-2 rounded border border-zinc-800/80 bg-zinc-950/50 px-2 py-1"
              >
                <span className="min-w-0 truncate text-zinc-300">{d.name}</span>
                <button
                  type="button"
                  onClick={() => deleteDraftById(d.id)}
                  className="shrink-0 text-red-400/90 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${t} text-zinc-600`}>No drafts yet for {accountUsername}.</p>
        )}
      </div>
    );
  }

  const presetMeta = MANGA_BRUSH_CONFIG[brushPreset];
  const nextPageData = pages[currentPage + 1] ?? "";
  const displayW = MANGA_PAGE_PIXEL_WIDTH * zoom;
  const displayH = MANGA_PAGE_PIXEL_HEIGHT * zoom;

  const canvasRow = (
    <div
      className={`mx-auto flex w-fit min-w-min select-none items-start justify-start gap-5 ${twoPageView ? "lg:gap-8" : ""}`}
    >
      <div ref={outerRef} className="flex w-full justify-center select-none">
        <div
          ref={wrapRef}
          className="relative cursor-none overflow-hidden rounded-lg border border-zinc-400/70 bg-white shadow-2xl shadow-black/50 select-none"
          onPointerEnter={(e) => positionBrushHair(e.clientX, e.clientY)}
          onPointerMove={(e) => positionBrushHair(e.clientX, e.clientY)}
          onPointerLeave={hideBrushHair}
        >
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-none touch-none select-none"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              positionBrushHair(e.clientX, e.clientY);
              e.currentTarget.setPointerCapture(e.pointerId);
              start(getPoint(e.currentTarget, e.clientX, e.clientY));
            }}
            onPointerMove={(e) => {
              positionBrushHair(e.clientX, e.clientY);
              if (drawing.current) e.preventDefault();
              if (!drawing.current) return;
              move(getPoint(e.currentTarget, e.clientX, e.clientY));
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              end();
            }}
            onPointerLeave={end}
            onPointerCancel={end}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
          <svg
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            viewBox={`0 0 ${MANGA_B4_TRIM_MM.width} ${MANGA_B4_TRIM_MM.height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <rect
              x="0.5"
              y="0.5"
              width={MANGA_B4_TRIM_MM.width - 1}
              height={MANGA_B4_TRIM_MM.height - 1}
              fill="none"
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth="1"
            />
            <rect
              x={MANGA_LIVE_AREA_MM.marginMm}
              y={MANGA_LIVE_AREA_MM.marginMm}
              width={MANGA_LIVE_AREA_MM.width}
              height={MANGA_LIVE_AREA_MM.height}
              fill="none"
              stroke="rgba(113, 113, 122, 0.6)"
              strokeWidth="0.9"
              strokeDasharray="5 4"
            />
            <PanelTemplateGuideGroup templateId={panelTemplate} />
          </svg>
          <div
            ref={brushHairRef}
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: 0, top: 0, visibility: "hidden" }}
            aria-hidden
          >
            <div className="relative h-5 w-5">
              <div className="absolute left-1/2 top-1/2 h-5 w-px -translate-x-1/2 -translate-y-1/2 bg-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.85)]" />
              <div className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.85)]" />
            </div>
          </div>
        </div>
      </div>
      {twoPageView ? (
        <div
          className="w-fit shrink-0 overflow-hidden rounded-lg border border-zinc-600/60 bg-zinc-900/80 shadow-2xl shadow-black/35"
          style={{
            width: `${displayW}px`,
            height: `${displayH}px`,
          }}
        >
          {nextPageData ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL preview for in-editor next page
            <img
              src={nextPageData}
              alt={`Page ${currentPage + 2} preview`}
              draggable={false}
              className="h-full w-full select-none object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-zinc-400">
              Next page preview appears here. Create or draw on page {currentPage + 2}.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  if (immersive) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#1a1a1d] text-zinc-100 select-none">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-900/95 px-3 py-2 shadow-sm shadow-black/40">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-2 py-1">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded border border-zinc-600 px-2 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-zinc-400">
              {currentPage + 1} / {pages.length}
            </span>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === pages.length - 1}
              className="rounded border border-zinc-600 px-2 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              onClick={createNextPage}
              className="rounded bg-amber-400 px-2 py-1 text-xs font-semibold text-zinc-950 hover:bg-amber-300"
            >
              + Page
            </button>
          </div>
          <div className="mx-1 h-6 w-px bg-zinc-700" aria-hidden />
          <button
            type="button"
            onClick={undo}
            disabled={historyDepth === 0}
            className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={redoDepth === 0}
            className="rounded border border-zinc-600 px-3 py-1.5 text-xs font-medium hover:bg-zinc-800 disabled:opacity-40"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="rounded border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="rounded bg-amber-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-300"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={() => void onExitStudio?.()}
            className="ml-auto rounded border border-zinc-500 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-700"
          >
            Exit studio
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside className="flex shrink-0 select-text flex-col gap-4 overflow-y-auto border-zinc-800 p-3 lg:w-56 lg:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Tools
            </p>
            <label
              className={`flex flex-col gap-1 text-xs ${
                brushPreset === "eraser" ||
                brushPreset === "pencil" ||
                brushPreset === "white"
                  ? "opacity-50"
                  : ""
              }`}
            >
              <span className="text-zinc-500">Ink</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={
                  brushPreset === "eraser" ||
                  brushPreset === "pencil" ||
                  brushPreset === "white"
                }
                className="h-10 w-full max-w-[10rem] cursor-pointer rounded border border-zinc-600 bg-zinc-950"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-500">Stroke size</span>
              <input
                type="range"
                min={1}
                max={24}
                value={brush}
                onChange={(e) => setBrush(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <span className="tabular-nums text-zinc-400">{brush}</span>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-500">Brush</span>
              <select
                value={brushPreset}
                onChange={(e) =>
                  setBrushPreset(e.target.value as MangaBrushPreset)
                }
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
              >
                {MANGA_BRUSH_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {MANGA_BRUSH_CONFIG[id].label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-[11px] leading-snug text-zinc-500">
              <span className="font-medium text-zinc-400">{presetMeta.label}:</span>{" "}
              {presetMeta.blurb}
            </p>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-zinc-500">Panel guides</span>
              <select
                value={panelTemplate}
                onChange={(e) =>
                  setPanelTemplate(e.target.value as PanelTemplateId)
                }
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm"
              >
                {PANEL_TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={twoPageView}
                onChange={(e) => setTwoPageView(e.target.checked)}
                className="accent-amber-400"
              />
              2-page view
            </label>
            <div className="border-t border-zinc-800 pt-3">
              <p className="mb-1 text-[10px] font-semibold uppercase text-zinc-500">
                View
              </p>
              <input
                type="range"
                min={0.08}
                max={2.5}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-amber-400"
                aria-label="Zoom"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(0.42)}
                  className="text-amber-400/90 hover:underline"
                >
                  Reset
                </button>
              </div>
              <p className="mt-2 text-[10px] leading-tight text-zinc-600">
                Scroll to pan. Ctrl/⌘+scroll to zoom.
              </p>
            </div>
            {renderAccountDrafts(true)}
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2 lg:p-3">
            <div
              className="min-h-0 flex-1 select-none overflow-auto overscroll-contain rounded-lg border border-zinc-700/60 bg-zinc-950/50 p-3"
              onWheel={handleStageWheel}
            >
              {canvasRow}
            </div>
            <p className="mt-2 shrink-0 text-[10px] text-zinc-600">
              Sheet {MANGA_PAGE_PIXEL_WIDTH}×{MANGA_PAGE_PIXEL_HEIGHT}px · Undo{" "}
              {MAX_CANVAS_UNDO_STEPS} steps max
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={studioRootRef}
      className="select-none space-y-4 [&:fullscreen]:box-border [&:fullscreen]:h-dvh [&:fullscreen]:max-h-dvh [&:fullscreen]:overflow-y-auto [&:fullscreen]:overflow-x-hidden [&:fullscreen]:overscroll-y-contain [&:fullscreen]:bg-gradient-to-b [&:fullscreen]:from-zinc-950 [&:fullscreen]:via-zinc-900 [&:fullscreen]:to-zinc-950 [&:fullscreen]:p-4 [&:fullscreen]:pb-6"
    >
      <div className="flex select-text flex-col gap-3 rounded-xl border border-zinc-600/50 bg-zinc-800/85 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center gap-3">
        <div className="mr-1 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 px-2 py-1">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-zinc-300">
            Page {currentPage + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === pages.length - 1}
            className="rounded-md border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
          <button
            type="button"
            onClick={createNextPage}
            className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            + New page
          </button>
        </div>
        <label
          className={`flex items-center gap-2 text-sm text-zinc-200 ${
            brushPreset === "eraser" || brushPreset === "pencil" || brushPreset === "white"
              ? "opacity-50"
              : ""
          }`}
        >
          <span className="text-zinc-400">Ink</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={
              brushPreset === "eraser" ||
              brushPreset === "pencil" ||
              brushPreset === "white"
            }
            className="h-9 w-12 cursor-pointer rounded border border-zinc-600 bg-zinc-950 disabled:cursor-not-allowed"
          />
        </label>
        <label className="flex min-w-[140px] flex-1 items-center gap-2 text-sm text-zinc-200">
          <span className="shrink-0 text-zinc-400">Size</span>
          <input
            type="range"
            min={1}
            max={24}
            value={brush}
            onChange={(e) => setBrush(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <span className="w-6 tabular-nums text-zinc-400">{brush}</span>
        </label>
        <button
          type="button"
          onClick={undo}
          disabled={historyDepth === 0}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Undo (Ctrl+Z)
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={redoDepth === 0}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Redo (Ctrl+Y)
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Clear page
        </button>
        <button
          type="button"
          onClick={downloadPng}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Download PNG
        </button>
        {immersive ? (
          <button
            type="button"
            onClick={() => void onExitStudio?.()}
            className="rounded-lg border border-zinc-500 bg-zinc-700/80 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-600"
          >
            Exit studio
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="rounded-lg border border-amber-500/60 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-400 hover:bg-amber-500/25"
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen maker"}
          </button>
        )}
        <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={twoPageView}
            onChange={(e) => setTwoPageView(e.target.checked)}
            className="accent-amber-400"
          />
          2-page view
        </label>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">Manga brush</span>
            <select
              value={brushPreset}
              onChange={(e) => setBrushPreset(e.target.value as MangaBrushPreset)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              {MANGA_BRUSH_ORDER.map((id) => (
                <option key={id} value={id}>
                  {MANGA_BRUSH_CONFIG[id].label} — {MANGA_BRUSH_CONFIG[id].blurb}
                </option>
              ))}
            </select>
          </label>
          <p className="max-w-xl text-xs leading-relaxed text-zinc-500 sm:pb-2">
            <span className="font-semibold text-zinc-400">{presetMeta.label}:</span>{" "}
            {presetMeta.blurb}. Size slider scales each tool.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-zinc-600/40 pt-3 sm:flex-row sm:items-end sm:gap-4">
          <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">Panel layout overlay</span>
            <select
              value={panelTemplate}
              onChange={(e) => setPanelTemplate(e.target.value as PanelTemplateId)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            >
              {PANEL_TEMPLATE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <p className="max-w-xl text-xs leading-relaxed text-zinc-500 sm:pb-2">
            Low-opacity dashed guides inside the live area. They stay on screen
            only—your exported PNG is still just the drawing.
          </p>
        </div>
        {renderAccountDrafts(false)}
      </div>

      <div className="flex select-text flex-wrap items-center gap-3 rounded-xl border border-zinc-600/40 bg-zinc-900/60 px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          View zoom
        </span>
        <input
          type="range"
          min={0.08}
          max={2.5}
          step={0.02}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-2 w-[min(100%,220px)] accent-amber-400"
          aria-label="Canvas view zoom"
        />
        <span className="min-w-[3.5rem] tabular-nums text-sm text-zinc-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom(0.42)}
          className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
        >
          Reset view
        </button>
        <p className="text-xs text-zinc-500">
          Scroll the stage to pan. Hold Ctrl (or ⌘) and scroll to zoom in or out.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-800/50 p-5 ring-1 ring-zinc-600/30 sm:p-8">
        <div
          className="max-h-[min(88dvh,920px)] w-full select-none overflow-auto overscroll-contain rounded-xl border border-zinc-700/50 bg-zinc-950/30 p-4 sm:p-6"
          onWheel={handleStageWheel}
        >
          {canvasRow}
        </div>
      </div>
      <p className="select-text text-xs text-zinc-500">
        Pixel sheet: {MANGA_PAGE_PIXEL_WIDTH}×{MANGA_PAGE_PIXEL_HEIGHT} (same
        proportions as B4 trim {MANGA_B4_TRIM_MM.width}×{MANGA_B4_TRIM_MM.height}{" "}
        mm). Dashed overlay ≈ live area ({MANGA_LIVE_AREA_MM.width}×
        {MANGA_LIVE_AREA_MM.height} mm). PNG export uses full pixel resolution.
        Undo keeps the last {MAX_CANVAS_UNDO_STEPS} steps at this size to save
        memory.
        {isFullscreen ? " Press Esc to exit fullscreen." : ""}
      </p>
    </div>
  );
}
