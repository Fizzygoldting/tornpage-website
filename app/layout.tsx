import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeHelpWidget } from "./ThemeHelpWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TornPage",
  description: "A platform to upload, read, and browse community manga.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="site-body min-h-full">
        <header className="border-b border-zinc-800 bg-zinc-950/90">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
            <Link href="/" className="text-lg font-semibold text-amber-300">
              TornPage
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <Link href="/" className="text-zinc-200 transition hover:text-amber-300">
                Home
              </Link>
              <Link href="/browse" className="text-zinc-200 transition hover:text-amber-300">
                Browse
              </Link>
              <Link href="/read" className="text-zinc-200 transition hover:text-amber-300">
                Read
              </Link>
              <Link href="/upload" className="text-zinc-200 transition hover:text-amber-300">
                Upload
              </Link>
              <Link
                href="/manga-creator"
                className="text-zinc-200 transition hover:text-amber-300"
              >
                Create
              </Link>
              <Link href="/contact" className="text-zinc-200 transition hover:text-amber-300">
                Contact
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <ThemeHelpWidget />
      </body>
    </html>
  );
}
