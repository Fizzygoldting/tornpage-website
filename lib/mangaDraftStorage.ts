import {
  TORNPAGE_SESSION_KEY,
  type TornpageSession,
} from "@/lib/tornpageSession";

export const MANGA_DRAFTS_STORAGE_KEY = "tornpage_manga_drafts_v1";

export type MangaDraft = {
  id: string;
  username: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** PNG data URLs per page; empty string = blank page */
  pages: string[];
};

export function readSessionUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TORNPAGE_SESSION_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as TornpageSession;
    const u = j?.username?.trim();
    return u && u.length >= 2 ? u : null;
  } catch {
    return null;
  }
}

function isMangaDraft(x: unknown): x is MangaDraft {
  if (!x || typeof x !== "object") return false;
  const d = x as Record<string, unknown>;
  return (
    typeof d.id === "string" &&
    typeof d.username === "string" &&
    typeof d.name === "string" &&
    typeof d.createdAt === "number" &&
    typeof d.updatedAt === "number" &&
    Array.isArray(d.pages) &&
    d.pages.every((p) => typeof p === "string")
  );
}

function readAllDrafts(): MangaDraft[] {
  try {
    const raw = window.localStorage.getItem(MANGA_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMangaDraft);
  } catch {
    return [];
  }
}

function writeAllDrafts(all: MangaDraft[]): void {
  window.localStorage.setItem(MANGA_DRAFTS_STORAGE_KEY, JSON.stringify(all));
}

export function listDraftsForUser(username: string): MangaDraft[] {
  return readAllDrafts()
    .filter((d) => d.username === username)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/** "Draft", then "Draft 1", "Draft 2", … skipping names already used by this user. */
export function nextDefaultDraftName(username: string): string {
  const mine = listDraftsForUser(username);
  const taken = new Set(mine.map((d) => d.name.trim().toLowerCase()));
  for (let i = 0; i < 10_000; i++) {
    const name = i === 0 ? "Draft" : `Draft ${i}`;
    if (!taken.has(name.toLowerCase())) return name;
  }
  return `Draft ${Date.now()}`;
}

export function saveMangaDraft(input: {
  username: string;
  /** When set, updates that draft (same owner). */
  id?: string | null;
  /** Trimmed; empty uses auto name for new, or keeps existing name on update. */
  nameInput?: string;
  pages: string[];
}):
  | { ok: true; draft: MangaDraft }
  | { ok: false; error: string } {
  const pages = input.pages.length ? [...input.pages] : [""];
  const all = readAllDrafts();
  const now = Date.now();
  const trimmedName = input.nameInput?.trim() ?? "";

  if (input.id) {
    const idx = all.findIndex(
      (d) => d.id === input.id && d.username === input.username,
    );
    if (idx === -1) return { ok: false, error: "That draft no longer exists." };
    const prev = all[idx]!;
    const name = trimmedName || prev.name;
    const updated: MangaDraft = {
      ...prev,
      name,
      pages,
      updatedAt: now,
    };
    all[idx] = updated;
    try {
      writeAllDrafts(all);
    } catch {
      return {
        ok: false,
        error: "Could not save (browser storage full or blocked).",
      };
    }
    return { ok: true, draft: updated };
  }

  const name = trimmedName || nextDefaultDraftName(input.username);
  const draft: MangaDraft = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `d-${now}-${Math.random().toString(36).slice(2, 9)}`,
    username: input.username,
    name,
    createdAt: now,
    updatedAt: now,
    pages,
  };
  all.push(draft);
  try {
    writeAllDrafts(all);
  } catch {
    return {
      ok: false,
      error: "Could not save (browser storage full or blocked).",
    };
  }
  return { ok: true, draft };
}

export function deleteMangaDraft(username: string, id: string): boolean {
  const all = readAllDrafts();
  const next = all.filter((d) => !(d.id === id && d.username === username));
  if (next.length === all.length) return false;
  writeAllDrafts(next);
  return true;
}
