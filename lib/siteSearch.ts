import { MANGA_BROWSE_CARDS, type MangaBrowseCard } from "@/lib/browseManga";
import { USER_PROFILES } from "@/lib/userProfiles";
import { authorHrefForName, seriesHrefForTitle } from "@/lib/mangaLinks";

export type SearchMode = "manga" | "creators" | "users";

export type MangaSearchHit = {
  kind: "manga";
  card: MangaBrowseCard;
  href: string | null;
};

export type CreatorSearchHit = {
  kind: "creator";
  name: string;
  sampleTitle: string;
  href: string | null;
};

export type UserSearchHit = {
  kind: "user";
  username: string;
  bio: string;
  avatarSrc: string;
  href: string;
};

const mangaCards = MANGA_BROWSE_CARDS;

function normalize(q: string): string {
  return q.trim().toLowerCase();
}

export function searchManga(query: string, limit = 8): MangaSearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const hits: MangaSearchHit[] = [];
  for (const card of mangaCards) {
    if (
      card.title.toLowerCase().includes(q) ||
      card.author.toLowerCase().includes(q) ||
      card.genre.toLowerCase().includes(q)
    ) {
      hits.push({
        kind: "manga",
        card,
        href: seriesHrefForTitle(card.title),
      });
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

export function searchCreators(query: string, limit = 8): CreatorSearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const byAuthor = new Map<string, string>();
  for (const card of mangaCards) {
    if (!byAuthor.has(card.author)) byAuthor.set(card.author, card.title);
  }

  const hits: CreatorSearchHit[] = [];
  for (const [name, sampleTitle] of byAuthor) {
    if (name.toLowerCase().includes(q)) {
      hits.push({
        kind: "creator",
        name,
        sampleTitle,
        href: authorHrefForName(name),
      });
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

/** Spaces + camelCase boundaries so "gold ting" can match FizzyGoldTing. */
function usernameSearchText(username: string): string {
  const lower = username.toLowerCase();
  const spaced = username
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
  return `${lower} ${spaced}`;
}

export function searchUsers(query: string, limit = 8): UserSearchHit[] {
  const q = normalize(query);
  if (!q) return [];

  const tokens = q.split(/\s+/).filter((t) => t.length > 0);
  const matchesProfile = (username: string, bio: string): boolean => {
    const u = username.toLowerCase();
    const b = bio.toLowerCase();
    const haystack = `${usernameSearchText(username)} ${u} ${b}`;
    if (tokens.length === 0) return false;
    return tokens.some(
      (t) => haystack.includes(t) || u.includes(t) || b.includes(t),
    );
  };

  const hits: UserSearchHit[] = [];
  for (const profile of Object.values(USER_PROFILES)) {
    if (matchesProfile(profile.username, profile.bio)) {
      hits.push({
        kind: "user",
        username: profile.username,
        bio: profile.bio,
        avatarSrc: profile.avatarSrc,
        href: `/profiles/${encodeURIComponent(profile.username)}`,
      });
      if (hits.length >= limit) break;
    }
  }
  return hits;
}

export function searchByMode(
  mode: SearchMode,
  query: string,
  limit = 8,
): (MangaSearchHit | CreatorSearchHit | UserSearchHit)[] {
  if (mode === "manga") return searchManga(query, limit);
  if (mode === "creators") return searchCreators(query, limit);
  return searchUsers(query, limit);
}

export function cardCoverPath(card: MangaBrowseCard): string {
  if (card.coverSrc) return card.coverSrc;
  if (card.coverFile) return `/covers/${encodeURIComponent(card.coverFile)}`;
  return "/logo.png";
}
