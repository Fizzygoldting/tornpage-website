export default function ContactPage() {
  return (
    <div className="paper-stage min-h-screen text-zinc-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
        <section className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-10">
          <h1 className="text-4xl font-bold text-amber-200">Contact</h1>
          <p className="mt-4 text-zinc-100">
            Want to partner with TornPage or ask a question?
          </p>
          <p className="mt-2 text-lg font-semibold text-amber-100">
            Phone: 804-690-2365
          </p>
        </section>
        <section className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-10">
          <p className="text-sm uppercase tracking-wide text-amber-300/90">
            Vision Statement
          </p>
          <p className="mt-3 text-lg italic text-amber-100/95">
            Started by a group of friends that thought manga could be way more.
          </p>
        </section>
      </main>
    </div>
  );
}
