"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-2">
      <Button
        variant={following ? "secondary" : "primary"}
        size="sm"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          const next = !following;
          setFollowing(next);
          try {
            const response = await fetch("/api/follows", {
              method: next ? "POST" : "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId })
            });

            if (!response.ok) {
              const payload = (await response.json()) as { error?: string };
              throw new Error(payload.error || "Unable to update follow state.");
            }

            router.refresh();
          } catch (err) {
            setFollowing(!next);
            setError(err instanceof Error ? err.message : "Unable to update follow state.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {following ? "Following" : "Follow"}
      </Button>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </div>
  );
}
