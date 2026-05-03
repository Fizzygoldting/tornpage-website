import {
  MANGA_BROWSE_CARDS,
  customUserMangaCards,
  isCustomUserMangaCard,
  type MangaBrowseCard,
} from "@/lib/browseManga";
import { USER_PROFILES } from "@/lib/userProfiles";
import { seriesHrefForTitle } from "@/lib/mangaLinks";

export type HomeMangaItem = {
  card: MangaBrowseCard;
  href: string | null;
};

function toItem(card: MangaBrowseCard): HomeMangaItem {
  return { card, href: seriesHrefForTitle(card.title) };
}

function coverKey(card: MangaBrowseCard): string {
  return card.coverSrc ?? card.coverFile ?? card.title;
}

function dedupe(cards: MangaBrowseCard[]): MangaBrowseCard[] {
  const seen = new Set<string>();
  const out: MangaBrowseCard[] = [];
  for (const c of cards) {
    const k = coverKey(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

/** Alternate mainstream picks with custom-library covers for the home rails. */
function interleaveMainstreamAndCustom(
  mainstream: MangaBrowseCard[],
  custom: MangaBrowseCard[],
  max = 12,
): MangaBrowseCard[] {
  const out: MangaBrowseCard[] = [];
  let i = 0;
  let j = 0;
  while (out.length < max && (i < mainstream.length || j < custom.length)) {
    if (i < mainstream.length) out.push(mainstream[i++]);
    if (out.length < max && j < custom.length) out.push(custom[j++]);
  }
  return dedupe(out);
}

/** Curated staff / weekly shelf — mixes flagship titles with your custom-folder series. */
export function staffWeeklyPicks(): HomeMangaItem[] {
  const map = new Map(MANGA_BROWSE_CARDS.map((c) => [c.title, c]));
  const mainstreamTitles = [
    "Kagurabachi",
    "20th Century Boys",
    "Blue Period",
    "Blue Lock",
    "Silent Hill F Manga",
  ];
  const mainstream = mainstreamTitles
    .map((t) => map.get(t))
    .filter(Boolean) as MangaBrowseCard[];
  const custom = customUserMangaCards();
  return interleaveMainstreamAndCustom(mainstream, custom, 12).map(toItem);
}

/** One spotlight per genre — prefers a custom-library title when that genre has one, then falls back. */
export function popularByGenreSpotlight(): HomeMangaItem[] {
  const genres: MangaBrowseCard["genre"][] = [
    "Action",
    "Psychological",
    "Sports",
    "Drama",
  ];
  const custom = customUserMangaCards();
  const picks: MangaBrowseCard[] = [];
  for (const g of genres) {
    const inGenre = MANGA_BROWSE_CARDS.filter((c) => c.genre === g);
    const customInGenre = custom.filter((c) => c.genre === g);
    const preferredCustom =
      customInGenre.find((c) => c.isPopular) ?? customInGenre[0];
    const fallback =
      inGenre.find((c) => c.isPopular && !isCustomUserMangaCard(c)) ??
      inGenre.find((c) => !isCustomUserMangaCard(c)) ??
      inGenre[0];
    const hot = preferredCustom ?? fallback;
    if (hot) picks.push(hot);
  }
  return dedupe(picks).map(toItem);
}

/** Personalized from saved profile favorites when logged in; otherwise a themed mix. */
export function personalizedShelf(username: string | null): HomeMangaItem[] {
  if (username && USER_PROFILES[username]) {
    const favTitles = USER_PROFILES[username].favorites.map((f) => f.title);
    const map = new Map(MANGA_BROWSE_CARDS.map((c) => [c.title, c]));
    const fromFavs = favTitles
      .map((t) => map.get(t))
      .filter(Boolean) as MangaBrowseCard[];
    const genres = new Set(fromFavs.map((c) => c.genre));
    const more = MANGA_BROWSE_CARDS.filter(
      (c) => genres.has(c.genre) && !fromFavs.some((f) => f.title === c.title),
    );
    const base = dedupe([...fromFavs, ...more]);
    const customExtras = customUserMangaCards().filter(
      (c) => !base.some((m) => m.title === c.title),
    );
    return dedupe([...customExtras.slice(0, 2), ...base])
      .slice(0, 8)
      .map(toItem);
  }

  const custom = customUserMangaCards();
  const action = MANGA_BROWSE_CARDS.filter((c) => c.genre === "Action" && c.isPopular);
  const drama = MANGA_BROWSE_CARDS.filter((c) => c.genre === "Drama").slice(0, 2);
  const mix = dedupe([
    ...custom.slice(0, 4),
    ...action.slice(0, 2),
    ...drama,
  ]);
  return mix.slice(0, 8).map(toItem);
}
