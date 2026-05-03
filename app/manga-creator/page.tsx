import { MangaCreatorClient } from "./MangaCreatorClient";

export default function MangaCreatorPage() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-amber-300">Manga creator</h1>
          <p className="mt-2 max-w-2xl text-zinc-300">
            Each page is a fixed high-resolution pixel sheet (3840px wide, B4
            proportions). Open the fullscreen studio for a paint-style workspace;
            guides and exports work the same. Signed-in users can save named
            drafts in the browser (same device as your account).
          </p>
        </div>

        <MangaCreatorClient
          gateAside={
            <>
              <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-amber-200">
                  Quick tutorial
                </h2>
                <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-zinc-300">
                  <li>
                    <strong className="text-zinc-100">Thumbnails first.</strong>{" "}
                    Tiny boxes to plan what happens in each panel—stick figures
                    are fine.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Roughs on one layer.</strong>{" "}
                    Big loose lines; fix details after the story reads clearly.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Read direction.</strong>{" "}
                    English-style: top-left → right, then down a row. Keep speech
                    bubbles near the speaker.
                  </li>
                  <li>
                    <strong className="text-zinc-100">Export.</strong> Download PNG
                    when you like a page, then you can trim or combine in another app
                    if needed.
                  </li>
                </ol>
              </section>

              <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-amber-200">
                  Beginner notes
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  <li>Big eyes = more emotion; simple dots work for far shots.</li>
                  <li>
                    Use fewer lines on faces—one eyebrow angle often sells the mood.
                  </li>
                  <li>
                    Speed lines and solid blacks behind a figure add motion without
                    redrawing the whole body.
                  </li>
                  <li>
                    Leave white space; crowded panels tire readers faster than simple
                    ones.
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl border border-zinc-700/60 bg-zinc-900/70 p-5 shadow-lg shadow-black/20">
                <h2 className="text-lg font-semibold text-amber-200">
                  Outline templates (trace lightly)
                </h2>
                <p className="mt-2 text-xs text-zinc-500">
                  Faint guides you can follow on paper—or redraw here for practice.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      4-panel strip
                    </p>
                    <svg
                      viewBox="0 0 200 260"
                      className="w-full rounded-lg border border-zinc-700 bg-white"
                      aria-hidden
                    >
                      <g stroke="#c4b8a8" strokeWidth="1.2" fill="none">
                        <rect x="8" y="8" width="88" height="108" rx="2" />
                        <rect x="104" y="8" width="88" height="108" rx="2" />
                        <rect x="8" y="124" width="88" height="108" rx="2" />
                        <rect x="104" y="124" width="88" height="108" rx="2" />
                      </g>
                    </svg>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Head turn (3/4)
                    </p>
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full rounded-lg border border-zinc-700 bg-white"
                      aria-hidden
                    >
                      <ellipse
                        cx="100"
                        cy="105"
                        rx="72"
                        ry="82"
                        stroke="#c4b8a8"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <path
                        d="M 52 118 Q 100 95 148 118"
                        stroke="#c4b8a8"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <circle cx="78" cy="98" r="6" stroke="#c4b8a8" fill="none" />
                      <circle cx="122" cy="96" r="5" stroke="#c4b8a8" fill="none" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Speech bubble
                    </p>
                    <svg
                      viewBox="0 0 200 120"
                      className="w-full rounded-lg border border-zinc-700 bg-white"
                      aria-hidden
                    >
                      <path
                        d="M 30 40 Q 100 20 170 40 Q 185 60 170 80 Q 100 100 30 80 Q 15 60 30 40 M 70 78 L 55 105 L 88 85"
                        stroke="#c4b8a8"
                        strokeWidth="1.2"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>
              </section>
            </>
          }
        />
      </main>
    </div>
  );
}
