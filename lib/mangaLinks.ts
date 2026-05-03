/** Shared link helpers for series and creators used across Browse, Home, Search. */

export function seriesHrefForTitle(title: string): string | null {
  if (title === "Kagurabachi") return "/manga/kagurabachi";
  return null;
}

export function authorHrefForName(author: string): string | null {
  if (author === "Takeru Hokazono") return "/authors/takeru-hokazono";
  return null;
}
