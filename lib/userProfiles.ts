export type ProfileFavorite = {
  title: string;
  mangaHref?: string;
  /** Browse card file under `/covers/` */
  coverFile?: string;
  /** Full public URL (e.g. reader title cover) */
  coverSrc?: string;
};

export type ProfileRating = {
  title: string;
  score: number;
  note?: string;
  mangaHref?: string;
};

export type ProfileListItem = {
  title: string;
  mangaHref?: string;
  coverFile?: string;
  coverSrc?: string;
};

export type ProfileList = {
  name: string;
  description?: string;
  items: ProfileListItem[];
};

export type ProfileCommentActivity = {
  mangaTitle: string;
  excerpt: string;
  chapterLabel?: string;
  mangaHref?: string;
};

export type CommunityMangaPick = {
  title: string;
  tagline: string;
  /** Put files in `public/custom-user-manga/` (e.g. from your “More Manga Custom by Users” folder). */
  coverSrc: string;
};

export type UserProfile = {
  username: string;
  avatarSrc: string;
  bio: string;
  memberSince: string;
  favorites: ProfileFavorite[];
  ratings: ProfileRating[];
  lists: ProfileList[];
  activity: ProfileCommentActivity[];
  customMangaPicks: CommunityMangaPick[];
};

/** URL path for a reader commenter’s profile (opens well in a new tab). */
export function profileHref(username: string): string {
  return `/profiles/${encodeURIComponent(username)}`;
}

export function profileCoverSrc(entry: {
  coverFile?: string;
  coverSrc?: string;
}): string {
  if (entry.coverSrc) return entry.coverSrc;
  if (entry.coverFile) return `/covers/${encodeURIComponent(entry.coverFile)}`;
  return "/logo.png";
}

export function mangaHrefForTitle(title: string): string | undefined {
  if (title === "Kagurabachi") return "/manga/kagurabachi";
  if (title === "Spy × Family") return "/read/spy-x-family";
  return undefined;
}

export const USER_PROFILES: Record<string, UserProfile> = {
  DenjiFan563: {
    username: "DenjiFan563",
    avatarSrc: "/comments/profiles/DenjiFan563.jpeg",
    bio: "Action-first reader. Chasing the next big spread and messy protagonists.",
    memberSince: "Mar 2024",
    favorites: [
      {
        title: "Kagurabachi",
        coverFile: "Kagurabachi.jpg",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
      {
        title: "Beshari Gurashi Vol. 5",
        coverSrc: "/custom-user-manga/beshari-gurashi-vol-5.jpeg",
      },
      {
        title: "Jujutsu Kaisen",
        coverFile: "Jujutsu Kaisen.avif",
      },
    ],
    ratings: [
      {
        title: "Kagurabachi",
        score: 9,
        note: "Pacing jumped hard this arc — in a good way.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
      {
        title: "One Punch Man",
        score: 8,
        note: "Murata pages are unfair.",
      },
    ],
    lists: [
      {
        name: "Weekend binge",
        description: "Stuff I reread when I want dopamine.",
        items: [
          { title: "Kagurabachi", mangaHref: mangaHrefForTitle("Kagurabachi"), coverFile: "Kagurabachi.jpg" },
          { title: "Sakamoto Days", coverFile: "Sakamoto Days.webp" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        chapterLabel: "Ch. 12",
        excerpt: "That spread on this chapter was insane. The pacing is getting better every release.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Beshari Gurashi Vol. 5",
        tagline: "From your custom user-manga collection in Downloads.",
        coverSrc: "/custom-user-manga/beshari-gurashi-vol-5.jpeg",
      },
    ],
  },
  FizzyGoldTing: {
    username: "FizzyGoldTing",
    avatarSrc: "/comments/profiles/FizzyGoldTing.jpg",
    bio: "Book-mode loyalist. Panel flow > everything.",
    memberSince: "Jan 2025",
    favorites: [
      { title: "20th Century Boys", coverFile: "20th Century Boys.webp" },
      { title: "Blue", coverSrc: "/custom-user-manga/blue-high-rated.jpg" },
      { title: "The Promised Neverland", coverFile: "The Promised Neverland.png" },
      {
        title: "Spy × Family",
        coverSrc: "/manga/spy-x-family/Cover.webp",
        mangaHref: mangaHrefForTitle("Spy × Family"),
      },
    ],
    ratings: [
      { title: "Spy × Family", score: 10, note: "Comfort food manga.", mangaHref: mangaHrefForTitle("Spy × Family") },
      { title: "Blue Period", score: 9 },
    ],
    lists: [
      {
        name: "Panel study",
        items: [
          { title: "20th Century Boys", coverFile: "20th Century Boys.webp" },
          { title: "Akira", coverFile: "Akira.png" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        excerpt: "Love the panel flow here. The action is way easier to follow in book mode.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Blue",
        tagline: "High rated community pick.",
        coverSrc: "/custom-user-manga/blue-high-rated.jpg",
      },
    ],
  },
  KojimaIsThinking: {
    username: "KojimaIsThinking",
    avatarSrc: "/comments/profiles/KojimaIsThinking.jpeg",
    bio: "Cliffhanger enjoyer / sufferer. Writes essays in comment boxes.",
    memberSince: "Nov 2023",
    favorites: [
      { title: "Kid I Luck", coverSrc: "/custom-user-manga/kid-i-luck.jpg" },
      { title: "Jojos Bizzare Adventure", coverFile: "Jojos Bizzare Adventure.jpeg" },
      { title: "Akira", coverFile: "Akira.png" },
    ],
    ratings: [
      { title: "Jojos Bizzare Adventure", score: 10, note: "It’s a lifestyle." },
      { title: "Kagurabachi", score: 8, mangaHref: mangaHrefForTitle("Kagurabachi") },
    ],
    lists: [
      {
        name: "Mind-benders",
        items: [
          { title: "20th Century Boys", coverFile: "20th Century Boys.webp" },
          { title: "The Promised Neverland", coverFile: "The Promised Neverland.png" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        chapterLabel: "Latest",
        excerpt: "Chapter cliffhanger is brutal. Need the next chapter right now.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Kid I Luck",
        tagline: "Shonen/seinen community favorite.",
        coverSrc: "/custom-user-manga/kid-i-luck.jpg",
      },
    ],
  },
  MyNameisEven: {
    username: "MyNameisEven",
    avatarSrc: "/comments/profiles/MyNameisEven.jpeg",
    bio: "Background-art appreciator. Zooms in on the wrong panels on purpose.",
    memberSince: "Aug 2024",
    favorites: [
      { title: "Mario (One-Shot)", coverSrc: "/custom-user-manga/mario-one-shot.jpg" },
      { title: "Blue Period", coverFile: "Blue Period.png" },
      { title: "Akira", coverFile: "Akira.png" },
    ],
    ratings: [
      { title: "Blue Period", score: 9, note: "Color theory as manga." },
      { title: "Akira", score: 10 },
    ],
    lists: [
      {
        name: "Art flex",
        items: [
          { title: "One Punch Man", coverFile: "One Punch Man.png" },
          { title: "Blue Period", coverFile: "Blue Period.png" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        excerpt: "The background details on these pages are super clean.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Mario (One-Shot)",
        tagline: "Masashi Kishimoto one-shot.",
        coverSrc: "/custom-user-manga/mario-one-shot.jpg",
      },
    ],
  },
  Stressedg3rl: {
    username: "Stressedg3rl",
    avatarSrc: "/comments/profiles/Stressedg3rl.jpeg",
    bio: "Scroll-mode for life. Reads on the bus between shifts.",
    memberSince: "Feb 2025",
    favorites: [
      { title: "School Mint", coverSrc: "/custom-user-manga/school-mint.jpg" },
      {
        title: "Spy × Family",
        coverSrc: "/manga/spy-x-family/Cover.webp",
        mangaHref: mangaHrefForTitle("Spy × Family"),
      },
    ],
    ratings: [
      { title: "Spy × Family", score: 9, mangaHref: mangaHrefForTitle("Spy × Family") },
      { title: "Blue Lock", score: 8 },
    ],
    lists: [
      {
        name: "Easy reads",
        items: [
          {
            title: "Spy × Family",
            mangaHref: mangaHrefForTitle("Spy × Family"),
            coverSrc: "/manga/spy-x-family/Cover.webp",
          },
          { title: "Sakamoto Days", coverFile: "Sakamoto Days.webp" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        excerpt: "I switched to scroll mode for this chapter and it was such a smooth read.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "School Mint",
        tagline: "Ongoing user-uploaded title.",
        coverSrc: "/custom-user-manga/school-mint.jpg",
      },
    ],
  },
  ThatNerd: {
    username: "ThatNerd",
    avatarSrc: "/comments/profiles/ThatNerd.jpeg",
    bio: "Composition nerd. Will pause on a single panel for ten minutes.",
    memberSince: "Jun 2024",
    favorites: [
      { title: "Seto Utsumi Vol. 5", coverSrc: "/custom-user-manga/seto-utsumi-vol-5.jpeg" },
      { title: "Shiori Experience Vol. 9", coverSrc: "/custom-user-manga/shiori-experience-vol-9.jpeg" },
      { title: "Kagurabachi", coverFile: "Kagurabachi.jpg", mangaHref: mangaHrefForTitle("Kagurabachi") },
    ],
    ratings: [
      { title: "Kagurabachi", score: 9, note: "Final panel composition is criminal.", mangaHref: mangaHrefForTitle("Kagurabachi") },
    ],
    lists: [
      {
        name: "Cinema panels",
        items: [
          { title: "Kagurabachi", mangaHref: mangaHrefForTitle("Kagurabachi"), coverFile: "Kagurabachi.jpg" },
          { title: "Akira", coverFile: "Akira.png" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        excerpt: "Can we appreciate that final panel composition? Absolute cinema.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Seto Utsumi Vol. 5",
        tagline: "Community pick from your custom folder.",
        coverSrc: "/custom-user-manga/seto-utsumi-vol-5.jpeg",
      },
      {
        title: "Shiori Experience Vol. 9",
        tagline: "Another community title with strong engagement.",
        coverSrc: "/custom-user-manga/shiori-experience-vol-9.jpeg",
      },
    ],
  },
  Yormaisbird: {
    username: "Yormaisbird",
    avatarSrc: "/comments/profiles/Yormaisbird.jpeg",
    bio: "Re-reads favorite chapters for craft. Gentle spoilers in comments.",
    memberSince: "Sep 2023",
    favorites: [
      { title: "Silent Hill F Manga", coverSrc: "/custom-user-manga/silent-hill-f.webp" },
      { title: "The Promised Neverland", coverFile: "The Promised Neverland.png" },
      { title: "Kagurabachi", coverFile: "Kagurabachi.jpg", mangaHref: mangaHrefForTitle("Kagurabachi") },
    ],
    ratings: [
      { title: "The Promised Neverland", score: 9 },
      { title: "Kagurabachi", score: 8, mangaHref: mangaHrefForTitle("Kagurabachi") },
    ],
    lists: [
      {
        name: "Re-read rotation",
        items: [
          { title: "Kagurabachi", mangaHref: mangaHrefForTitle("Kagurabachi"), coverFile: "Kagurabachi.jpg" },
          { title: "The Promised Neverland", coverFile: "The Promised Neverland.png" },
        ],
      },
    ],
    activity: [
      {
        mangaTitle: "Kagurabachi",
        excerpt: "Great chapter. I keep coming back to this one to study the page turns.",
        mangaHref: mangaHrefForTitle("Kagurabachi"),
      },
    ],
    customMangaPicks: [
      {
        title: "Silent Hill F Manga",
        tagline: "Horror-themed community upload.",
        coverSrc: "/custom-user-manga/silent-hill-f.webp",
      },
    ],
  },
};

export function getUserProfile(username: string): UserProfile | undefined {
  return USER_PROFILES[username];
}

export function getAllProfileUsernames(): string[] {
  return Object.keys(USER_PROFILES);
}
