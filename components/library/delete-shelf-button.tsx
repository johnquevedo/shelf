"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteShelfButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={loading}
        onClick={async () => {
          const confirmed = window.confirm(`Delete "${name}"? Books will stay in the app and only be removed from this shelf.`);
          if (!confirmed) return;

          setLoading(true);
          setError("");

          try {
            const response = await fetch("/api/shelves", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug })
            });
            const payload = (await response.json()) as { error?: string };
            if (!response.ok) {
              throw new Error(payload.error || "Unable to delete shelf.");
            }

            router.push("/library");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to delete shelf.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Deleting..." : "Delete Shelf"}
      </Button>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
