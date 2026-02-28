"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Progress from "@radix-ui/react-progress";
import { Button } from "@/components/ui/button";

export function GoodreadsImport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<null | {
    importedBooks: number;
    importedRatings: number;
    importedReviews: number;
    skipped: number;
  }>(null);

  return (
    <form
      className="shell-card space-y-4 p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setLoading(true);
        const response = await fetch("/api/import/goodreads", {
          method: "POST",
          body: formData
        });
        const payload = (await response.json()) as typeof summary;
        setSummary(payload);
        setLoading(false);
        router.refresh();
      }}
    >
      <div>
        <h3 className="font-display text-2xl">Upload Goodreads Data</h3>
        <p className="mt-1 text-sm text-white/50">
          Import shelves, ratings, reviews, and reading history from a Goodreads CSV export.
        </p>
      </div>
      <input type="file" name="file" accept=".csv,text/csv" className="text-sm text-white/70" />
      {loading ? (
        <Progress.Root className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <Progress.Indicator className="h-full w-3/4 bg-accent transition-all" />
        </Progress.Root>
      ) : null}
      {summary ? (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Imported {summary.importedBooks} books, {summary.importedRatings} ratings,{" "}
          {summary.importedReviews} reviews. Skipped {summary.skipped}.
        </div>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Importing…" : "Import CSV"}
      </Button>
    </form>
  );
}
