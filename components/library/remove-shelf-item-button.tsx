"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RemoveShelfItemButton({ shelfSlug, bookId }: { shelfSlug: string; bookId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={async () => {
          setError("");
          const response = await fetch(`/api/shelves/${shelfSlug}/items`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId })
          });

          if (!response.ok) {
            const payload = (await response.json()) as { error?: string };
            setError(payload.error || "Unable to remove book from shelf.");
            return;
          }

          router.refresh();
        }}
      >
        Remove
      </Button>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
