"use client";

import { startTransition, useEffect, useState, useDeferredValue } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCover } from "@/components/ui/book-cover";
import { Button } from "@/components/ui/button";

type SearchResult = {
  workId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  publishedYear: number | null;
  isbn10?: string | null;
  isbn13?: string | null;
  localBookId?: string;
};

export function SearchPanel({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/books/search?q=${encodeURIComponent(deferredQuery)}`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json()) as { results?: SearchResult[]; error?: string };
        if (!res.ok) {
          throw new Error(data.error || "Search failed.");
        }
        setResults(data.results || []);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setError(err instanceof Error ? err.message : "Search failed.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [deferredQuery]);

  return (
    <section className="shell-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl">Find your next book</h2>
          <p className="mt-1 text-sm text-white/50">Search Open Library and save books to your shelves.</p>
        </div>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title or author"
        className="h-12 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none"
      />
      {loading ? <p className="mt-4 text-sm text-white/50">Searching…</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.map((result) => (
          <div
            key={result.localBookId ?? result.workId}
            className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div className="grid grid-cols-[68px_1fr] gap-4">
              <div className="h-[96px] w-[68px]">
                <BookCover title={result.title} coverUrl={result.coverUrl} />
              </div>
              <div>
                <Link
                  href={result.localBookId ? `/books/${result.localBookId}` : `/books/open-library/${result.workId}`}
                  className="font-semibold text-white"
                >
                  {result.title}
                </Link>
                <p className="mt-1 text-sm text-white/50">{result.authors.join(", ")}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/35">
                  {result.publishedYear ?? "Unknown year"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      setError("");
                      if (result.localBookId) {
                        setSavingId(result.localBookId);
                        const response = await fetch("/api/shelves/want-to-read/items", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ bookId: result.localBookId })
                        });
                        setSavingId(null);
                        if (!response.ok) {
                          const payload = (await response.json()) as { error?: string };
                          setError(payload.error || "Unable to add book to shelf.");
                          return;
                        }
                        startTransition(() => router.push(`/books/${result.localBookId}`));
                        return;
                      }
                      setSavingId(result.workId);
                      const response = await fetch("/api/books/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...result,
                          shelfSlug: "want-to-read"
                        })
                      });
                      const payload = (await response.json()) as { bookId?: string };
                      setSavingId(null);
                      if (payload.bookId) {
                        startTransition(() => router.push(`/books/${payload.bookId}`));
                      } else {
                        setError("Unable to import book.");
                      }
                    }}
                    disabled={savingId === result.workId || savingId === result.localBookId}
                  >
                    {savingId === result.workId || savingId === result.localBookId ? "Saving…" : "Want to Read"}
                  </Button>
                  <Link href={result.localBookId ? `/books/${result.localBookId}` : `/books/open-library/${result.workId}`}>
                    <Button size="sm" variant="secondary">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
