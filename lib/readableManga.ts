export type ReadableManga = {
  slug: string;
  title: string;
  coverSrc: string;
  pageSrcs: string[];
};

const SPY_X_FAMILY_PAGE_COUNT = 53;

function spyFamilyPageSrcs(): string[] {
  const numberedPages = Array.from({ length: SPY_X_FAMILY_PAGE_COUNT }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `/manga/spy-x-family/${n}.webp`;
  });
  return ["/manga/spy-x-family/Cover.webp", ...numberedPages];
}

const READABLE_BY_SLUG: Record<string, ReadableManga> = {
  "spy-x-family": {
    slug: "spy-x-family",
    title: "Spy × Family",
    coverSrc: "/manga/spy-x-family/Cover.webp",
    pageSrcs: spyFamilyPageSrcs(),
  },
};

export function getReadableSlugs(): string[] {
  return Object.keys(READABLE_BY_SLUG);
}

export function getReadableManga(slug: string): ReadableManga | undefined {
  return READABLE_BY_SLUG[slug];
}
