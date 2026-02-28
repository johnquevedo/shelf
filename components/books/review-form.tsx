"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { Textarea } from "@/components/ui/textarea";
import { reviewSchema } from "@/lib/validators/reviews";

type Values = z.infer<typeof reviewSchema>;

export function ReviewForm({
  bookId,
  initialReview
}: {
  bookId: string;
  initialReview?: { rating: number | null; body: string | null } | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      bookId,
      rating: initialReview?.rating ?? null,
      body: initialReview?.body ?? null
    }
  });

  const rating = form.watch("rating") ?? 0;

  return (
    <form
      className="shell-card space-y-4 p-6"
      onSubmit={form.handleSubmit(async (values) => {
        setMessage(null);
        setError(null);
        const method = initialReview ? "PUT" : "POST";
        const response = await fetch("/api/reviews", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        if (response.ok) {
          setMessage("Review saved.");
          router.refresh();
        } else {
          const payload = (await response.json()) as { error?: string };
          setError(payload.error || "Unable to save review.");
        }
      })}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl">Your review</h3>
          <p className="mt-1 text-sm text-white/50">Update your rating and quick notes any time.</p>
        </div>
        <Stars interactive value={rating} onChange={(value) => form.setValue("rating", value)} />
      </div>
      <Textarea
        className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
        placeholder="What stood out? Keep it short."
        {...form.register("body")}
        value={form.watch("body") ?? ""}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-emerald-400">{message}</p>
        <Button type="submit">Save review</Button>
      </div>
      {error ? <p className="text-xs text-rose-400">{error}</p> : null}
    </form>
  );
}
