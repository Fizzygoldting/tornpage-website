"use client";

import Link from "next/link";
import { useState } from "react";
import { getAllProfileUsernames } from "@/lib/userProfiles";
import {
  TORNPAGE_SESSION_KEY,
  type TornpageSession,
} from "@/lib/tornpageSession";

const demoNames = getAllProfileUsernames();

export default function SignupPage() {
  const [username, setUsername] = useState(demoNames[0] ?? "");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim();
    if (u.length < 2) {
      setError("Pick a username at least 2 characters.");
      return;
    }
    const session: TornpageSession = { username: u };
    try {
      window.localStorage.setItem(TORNPAGE_SESSION_KEY, JSON.stringify(session));
    } catch {
      setError("Could not save locally.");
      return;
    }
    window.location.assign("/");
  }

  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto max-w-md px-4 py-16 md:px-6">
        <h1 className="text-3xl font-bold text-zinc-50">Create account</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Demo sign-in: we store your display name in the browser only. Choose a
          sample profile to unlock avatar and profile links, or type any name to
          try the flow.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-zinc-300">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              list="demo-users"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600/50"
              autoComplete="username"
            />
            <datalist id="demo-users">
              {demoNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </label>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500/90 py-3 font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Continue
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            ← Home
          </Link>
        </p>
      </main>
    </div>
  );
}
