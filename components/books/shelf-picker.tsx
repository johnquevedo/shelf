"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Shelf = {
  id: string;
  name: string;
  slug: string;
  isDefault?: boolean;
};

export function ShelfPicker({
  shelves,
  bookId,
  activeShelfSlugs,
  activeDefaultShelfSlug
}: {
  shelves: Shelf[];
  bookId: string;
  activeShelfSlugs: string[];
  activeDefaultShelfSlug: string | null;
}) {
  const router = useRouter();
  const [currentSlugs, setCurrentSlugs] = useState(activeShelfSlugs);
  const [defaultSlug, setDefaultSlug] = useState(activeDefaultShelfSlug);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const defaultShelves = shelves.filter((shelf) => shelf.isDefault);
  const customShelves = shelves.filter((shelf) => !shelf.isDefault);

  async function toggleShelf(slug: string, isActive: boolean, isDefault: boolean) {
    setPendingSlug(slug);
    setError("");
    const method = isActive && !isDefault ? "DELETE" : "POST";
    const response = await fetch(`/api/shelves/${slug}/items`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    if (response.ok) {
      if (isDefault) {
        const nextSlugs = currentSlugs.filter((entry) => !defaultShelves.some((shelf) => shelf.slug === entry));
        setCurrentSlugs([...nextSlugs, slug]);
        setDefaultSlug(slug);
        setMessage("Reading status updated.");
      } else if (isActive) {
        setCurrentSlugs(currentSlugs.filter((entry) => entry !== slug));
        setMessage("Removed from shelf.");
      } else {
        setCurrentSlugs([...currentSlugs, slug]);
        setMessage("Added to shelf.");
      }
      router.refresh();
    } else {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error || "Unable to update shelf.");
    }

    setPendingSlug(null);
  }

  return (
    <div className="shell-card space-y-4 p-6">
      <div>
        <h3 className="font-display text-2xl">Shelves</h3>
        <p className="mt-1 text-sm text-white/50">Use one default status and any number of custom shelves.</p>
      </div>
      <div className="grid gap-2">
        {defaultShelves.map((shelf) => {
          const active = defaultSlug === shelf.slug;
          return (
            <Button
              key={shelf.id}
              variant={active ? "primary" : "secondary"}
              className="justify-start"
              disabled={pendingSlug === shelf.slug}
              onClick={() => toggleShelf(shelf.slug, active, true)}
            >
              {active ? "Current: " : ""}
              {shelf.name}
            </Button>
          );
        })}
      </div>
      {customShelves.length ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Custom shelves</p>
          <div className="flex flex-wrap gap-2">
            {customShelves.map((shelf) => {
              const active = currentSlugs.includes(shelf.slug);
              return (
                <Button
                  key={shelf.id}
                  size="sm"
                  variant={active ? "primary" : "secondary"}
                  disabled={pendingSlug === shelf.slug}
                  onClick={() => toggleShelf(shelf.slug, active, false)}
                >
                  {shelf.name}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <p className="text-sm text-mint">{message}</p>
        <span className="text-xs uppercase tracking-[0.2em] text-white/30">
          {currentSlugs.length} shelf{currentSlugs.length === 1 ? "" : "s"}
        </span>
      </div>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
