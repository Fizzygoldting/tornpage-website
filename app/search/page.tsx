import { Suspense } from "react";
import SearchPageInner from "./SearchPageInner";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="paper-stage min-h-screen p-10 text-zinc-400">
          Loading search…
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
