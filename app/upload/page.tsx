import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
        <h1 className="text-4xl font-bold text-amber-300">Upload Chapters</h1>
        <p className="mt-4 max-w-3xl text-zinc-100">
          Publish your manga on TornPage—one series at a time, chapter by chapter.
          This is a starter form; saving and hosting files will hook up once your
          backend is ready.
        </p>
      </section>

        <form
          className="mt-10 space-y-10"
          action="#"
          method="post"
          encType="multipart/form-data"
        >
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-zinc-100 md:text-2xl">
            Series details
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Information readers see on your series page.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="series-title"
                className="block text-sm font-medium text-zinc-200"
              >
                Manga title
              </label>
              <input
                id="series-title"
                name="seriesTitle"
                type="text"
                placeholder="e.g. Midnight Alley"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-zinc-200"
              >
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a genre
                </option>
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="fantasy">Fantasy</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
                <option value="sci-fi">Sci-fi</option>
                <option value="slice-of-life">Slice of life</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cover"
                className="block text-sm font-medium text-zinc-200"
              >
                Series cover (optional)
              </label>
              <input
                id="cover"
                name="cover"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-300 hover:file:bg-zinc-700"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="synopsis"
                className="block text-sm font-medium text-zinc-200"
              >
                Synopsis
              </label>
              <textarea
                id="synopsis"
                name="synopsis"
                rows={4}
                placeholder="A short summary that appears on your series card…"
                className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-zinc-100 md:text-2xl">
            Chapter upload
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Add one chapter at a time. Later you can reorder pages and publish
            drafts from a dashboard.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="chapter-number"
                className="block text-sm font-medium text-zinc-200"
              >
                Chapter number
              </label>
              <input
                id="chapter-number"
                name="chapterNumber"
                type="number"
                min={1}
                placeholder="1"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div>
              <label
                htmlFor="chapter-title"
                className="block text-sm font-medium text-zinc-200"
              >
                Chapter title
              </label>
              <input
                id="chapter-title"
                name="chapterTitle"
                type="text"
                placeholder="e.g. The first night"
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="pages"
                className="block text-sm font-medium text-zinc-200"
              >
                Chapter pages (images)
              </label>
              <input
                id="pages"
                name="pages"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                multiple
                className="mt-2 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-300 hover:file:bg-zinc-700"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Select multiple files in reading order (Page 001, 002, …). PDF
                support can be added later.
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-zinc-200"
              >
                Creator notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Thank-you message, content warnings, etc."
                className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-200">
            <span className="font-semibold text-amber-200">Preview only.</span>{" "}
            Submit does not save yet—next step is an API route or database +
            file storage (e.g. S3, Uploadthing, or your server).
          </p>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled
          >
            Publish chapter (soon)
          </button>
        </div>
        </form>

        <section className="mt-10 rounded-2xl border border-zinc-700 bg-zinc-900/60 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-amber-300 md:text-2xl">
          Don&apos;t know where to start?
        </h2>
        <p className="mt-3 max-w-3xl text-zinc-200 md:text-lg">
          We have you covered! Use our in website manga maker to start your manga
          creating journey.
        </p>
        <Link
          href="/manga-creator"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          Open manga creator
        </Link>
        </section>
      </main>
    </div>
  );
}
