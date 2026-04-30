import Image from "next/image";
import Link from "next/link";
import {
  MANGA_BROWSE_CARDS,
  type MangaBrowseCard,
} from "@/lib/browseManga";

const mangaCards = MANGA_BROWSE_CARDS.filter(
  (card) =>
    !card.coverSrc?.startsWith("/custom-user-manga/") ||
    card.title === "Blue",
);

const genres: MangaBrowseCard["genre"][] = [
  "Action",
  "Psychological",
  "Sports",
  "Drama",
];
const recommendedTitles = ["20th Century Boys", "Blue Period", "Kagurabachi"];

function cardCoverSrc(card: MangaBrowseCard): string {
  if (card.coverSrc) return card.coverSrc;
  if (card.coverFile) return `/covers/${encodeURIComponent(card.coverFile)}`;
  return "/logo.png";
}

function getSeriesHref(title: string): string | null {
  if (title === "Kagurabachi") return "/manga/kagurabachi";
  return null;
}

function AuthorLine({
  author,
  allowProfileLink = true,
}: {
  author: string;
  allowProfileLink?: boolean;
}) {
  if (author === "Takeru Hokazono" && allowProfileLink) {
    return (
      <p>
        Author:{" "}
        <Link
          href="/authors/takeru-hokazono"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-amber-300 underline decoration-amber-400/70 underline-offset-2 transition hover:text-amber-200"
        >
          {author}
        </Link>
      </p>
    );
  }

  return <p>Author: {author}</p>;
}

function BrowseCard({
  card,
  badge,
  genreLabel,
  compact = false,
}: {
  card: MangaBrowseCard;
  badge?: string;
  genreLabel: string;
  compact?: boolean;
}) {
  const href = getSeriesHref(card.title);
  const cardClasses = compact
    ? "group overflow-hidden rounded-xl border border-amber-500/40 bg-zinc-900/80 transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-400/70"
    : "group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-500/60";
  const imageAspect = compact ? "aspect-[5/4]" : "aspect-[3/4]";
  const bodyClass = compact ? "space-y-1 p-3" : "space-y-2 p-4";
  const titleClass = compact
    ? "text-base font-semibold text-zinc-100"
    : "text-lg font-semibold text-zinc-100";
  const metaClass = compact
    ? "max-h-0 overflow-hidden text-xs text-zinc-300 opacity-0 transition-all duration-200 group-hover:mt-2 group-hover:max-h-24 group-hover:opacity-100"
    : "max-h-0 overflow-hidden text-sm text-zinc-300 opacity-0 transition-all duration-200 group-hover:mt-1 group-hover:max-h-28 group-hover:opacity-100";

  const content = (
    <>
      {href ? (
        <Link href={href} className="block">
          <div className={`relative ${imageAspect} w-full bg-zinc-800`}>
            <Image
              src={cardCoverSrc(card)}
              alt={`${card.title} cover`}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      ) : (
        <div className={`relative ${imageAspect} w-full bg-zinc-800`}>
          <Image
            src={cardCoverSrc(card)}
            alt={`${card.title} cover`}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className={bodyClass}>
        <div className="flex items-center justify-between gap-3">
          {href ? (
            <Link href={href} className={`${titleClass} transition hover:text-amber-300`}>
              {card.title}
            </Link>
          ) : (
            <h3 className={titleClass}>{card.title}</h3>
          )}
          {badge ? (
            <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs font-semibold text-amber-300">
              {badge}
            </span>
          ) : card.isPopular ? (
            <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs font-semibold text-amber-300">
              Popular
            </span>
          ) : null}
        </div>
        <p className="text-sm text-zinc-200">{genreLabel}</p>
        <div className={metaClass}>
          <AuthorLine author={card.author} />
          <p>
            Chapters: {card.chapters} · Volumes: {card.volumes}
          </p>
          <p>Views: {card.views}</p>
        </div>
      </div>
    </>
  );

  return (
    <article className={cardClasses}>
      {content}
    </article>
  );
}

export default function BrowsePage() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
        <h1 className="text-4xl font-bold text-amber-300">Browse Manga</h1>
        <p className="mt-4 max-w-3xl text-zinc-100">
          Explore user-posted manga by genre and discover what the community is
          reading most right now.
        </p>
      </section>

        <section className="mt-10 space-y-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-zinc-100">
              Recommended for You
            </h2>
            <p className="text-sm text-zinc-200">
              Personalized picks from user-posted manga.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {mangaCards
              .filter((card) => recommendedTitles.includes(card.title))
              .map((card) => (
                <BrowseCard
                  key={`recommended-${card.title}`}
                  card={card}
                  genreLabel={card.genre}
                  badge="Recommended"
                  compact
                />
              ))}
          </div>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-6">
          <h2 className="text-2xl font-bold tracking-tight text-amber-300 md:text-3xl">
            Hot Right Now
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            Popular manga across each genre right now.
          </p>
        </section>

        {genres.map((genre) => {
          const cards = mangaCards.filter((card) => card.genre === genre);
          return (
            <div key={genre}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-zinc-100">{genre}</h2>
                <p className="text-sm text-zinc-400">Popular titles marked below</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <BrowseCard
                    key={card.title}
                    card={card}
                    genreLabel={genre}
                  />
                ))}
              </div>
            </div>
          );
        })}
        </section>
      </main>
    </div>
  );
}
