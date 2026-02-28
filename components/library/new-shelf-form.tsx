"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createShelfSchema } from "@/lib/validators/shelves";

type Values = z.infer<typeof createShelfSchema>;

export function NewShelfForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(createShelfSchema),
    defaultValues: { name: "" }
  });

  return (
    <form
      className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 md:flex-row"
      onSubmit={form.handleSubmit(async (values) => {
        setMessage(null);
        setError(null);
        const response = await fetch("/api/shelves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });
        if (response.ok) {
          setMessage("Shelf created.");
          form.reset();
          router.refresh();
          return;
        }

        const payload = (await response.json()) as { error?: string };
        setError(payload.error || "Unable to create shelf.");
      })}
    >
      <Input
        className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
        placeholder="New shelf name"
        {...form.register("name")}
      />
      <Button type="submit" className="shrink-0">
        New Shelf
      </Button>
      {message ? <p className="text-sm text-mint">{message}</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
