import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  getAllProfileUsernames,
  getUserProfile,
  profileCoverSrc,
  type UserProfile,
} from "@/lib/userProfiles";

type PageProps = {
  params: Promise<{ username: string }>;
};

export function generateStaticParams() {
  return getAllProfileUsernames().map((username) => ({ username }));
}

export async function generateMetadata({ params }: PageProps) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const profile = getUserProfile(username);
  if (!profile) return { title: "Profile · TornPage" };
  return {
    title: `${profile.username} · TornPage`,
    description: profile.bio,
  };
}

function FavoriteCard({
  title,
  src,
  href,
}: {
  title: string;
  src: string;
  href?: string;
}) {
  const inner = (
    <div className="group overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/80 transition hover:border-amber-500/50">
      <div className="relative aspect-[3/4] w-full bg-zinc-800">
        <Image
          src={src}
          alt={`${title} cover`}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 33vw, 180px"
        />
      </div>
      <p className="truncate p-2 text-xs font-medium text-zinc-200 group-hover:text-amber-200">
        {title}
      </p>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="border-b border-zinc-700 pb-2 text-lg font-semibold text-amber-200">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const profile = getUserProfile(username);
  if (!profile) notFound();

  return <ProfileBody profile={profile} />;
}

function ProfileBody({ profile }: { profile: UserProfile }) {
  const nav = [
    { href: "#favorites", label: "Favorites" },
    { href: "#ratings", label: "Ratings" },
    { href: "#lists", label: "Lists" },
    { href: "#activity", label: "Comments" },
    { href: "#community", label: "Uploaded manga" },
  ];

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start gap-6 px-6 py-10 md:px-10">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg shadow-black/40">
            <Image
              src={profile.avatarSrc}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-zinc-50 md:text-4xl">
              {profile.username}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Member since {profile.memberSince} · MAL-style manga profile
            </p>
            <p className="mt-4 max-w-2xl text-zinc-300">{profile.bio}</p>
            <nav className="mt-6 flex flex-wrap gap-2">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-200"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-14 px-6 py-12 md:px-10">
        <Section id="favorites" title="Favorite manga">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.favorites.map((f) => (
              <FavoriteCard
                key={f.title}
                title={f.title}
                src={profileCoverSrc(f)}
                href={f.mangaHref}
              />
            ))}
          </div>
        </Section>

        <Section id="ratings" title="Ratings">
          <ul className="space-y-3">
            {profile.ratings.map((r) => (
              <li
                key={r.title}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3"
              >
                <div className="min-w-0">
                  {r.mangaHref ? (
                    <Link
                      href={r.mangaHref}
                      className="font-medium text-amber-200 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-100"
                    >
                      {r.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-zinc-100">{r.title}</span>
                  )}
                  {r.note ? (
                    <p className="mt-1 text-sm text-zinc-400">{r.note}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-lg font-bold text-amber-300">
                  {r.score}
                  <span className="text-sm font-normal text-zinc-500">/10</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="lists" title="Lists">
          <div className="space-y-8">
            {profile.lists.map((list) => (
              <div
                key={list.name}
                className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-5"
              >
                <h3 className="text-base font-semibold text-zinc-50">
                  {list.name}
                </h3>
                {list.description ? (
                  <p className="mt-1 text-sm text-zinc-400">{list.description}</p>
                ) : null}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {list.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2"
                    >
                      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                        <Image
                          src={profileCoverSrc(item)}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 py-1">
                        {item.mangaHref ? (
                          <Link
                            href={item.mangaHref}
                            className="line-clamp-2 text-sm font-medium text-amber-200 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-100"
                          >
                            {item.title}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                            {item.title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="activity" title="Comments on manga">
          <ul className="space-y-4">
            {profile.activity.map((row) => (
              <li
                key={`${row.mangaTitle}-${row.excerpt.slice(0, 24)}`}
                className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {row.mangaHref ? (
                    <Link
                      href={row.mangaHref}
                      className="font-semibold text-amber-200 underline decoration-amber-500/50 underline-offset-2 hover:text-amber-100"
                    >
                      {row.mangaTitle}
                    </Link>
                  ) : (
                    <span className="font-semibold text-zinc-100">
                      {row.mangaTitle}
                    </span>
                  )}
                  {row.chapterLabel ? (
                    <span className="text-xs text-zinc-500">
                      · {row.chapterLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-zinc-300">{row.excerpt}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="community" title="Uploaded manga">
          <p className="mb-4 text-sm text-zinc-400">
            Covers can point at files you add under{" "}
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-100/90">
              public/custom-user-manga/
            </code>{" "}
            (copy from your &quot;More Manga Custom by Users&quot; folder).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.customMangaPicks.map((m) => (
              <article
                key={m.title}
                className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900/70"
              >
                <div className="relative aspect-[16/10] w-full bg-zinc-800">
                  <Image
                    src={m.coverSrc}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-50">{m.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{m.tagline}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <p className="text-center text-xs text-zinc-500">
          <Link href="/browse" className="text-amber-300 hover:underline">
            Browse more titles
          </Link>
          {" · "}
          <Link href="/read" className="text-amber-300 hover:underline">
            Reader library
          </Link>
        </p>
      </main>
    </div>
  );
}
