"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TORNPAGE_SESSION_KEY } from "@/lib/tornpageSession";

export default function SettingsPage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TORNPAGE_SESSION_KEY);
      if (!raw) return;
      const j = JSON.parse(raw) as { username?: string };
      if (j.username) setUsername(j.username);
    } catch {
      /* ignore */
    }
  }, []);

  function signOut() {
    window.localStorage.removeItem(TORNPAGE_SESSION_KEY);
    window.location.assign("/");
  }

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto max-w-md px-4 py-16 md:px-6">
        <h1 className="text-3xl font-bold text-zinc-50">Settings</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Account preferences will live here. For now this is a local demo
          session only.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="text-sm text-zinc-500">Signed in as</p>
          <p className="mt-1 text-lg font-medium text-zinc-100">
            {username ?? "—"}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 w-full rounded-xl border border-zinc-600 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-200"
          >
            Sign out
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            ← Home
          </Link>
        </p>
      </main>
    </div>
  );
}
