"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { logReadingSchema } from "@/lib/validators/journal";

type Values = z.infer<typeof logReadingSchema>;

export function LogForm({
  books
}: {
  books: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(logReadingSchema),
    defaultValues: {
      bookId: books[0]?.id ?? "",
      pagesReadInt: 10,
      date: new Date().toISOString().slice(0, 10)
    }
  });

  if (!books.length) {
    return null;
  }

  return (
    <form
      className="shell-card grid gap-4 p-6 md:grid-cols-4"
      onSubmit={form.handleSubmit(async (values) => {
        const response = await fetch("/api/journal/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (response.ok) {
          setMessage("Pages logged.");
          router.refresh();
        }
      })}
    >
      <select
        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        {...form.register("bookId")}
      >
        {books.map((book) => (
          <option key={book.id} value={book.id} className="text-slate-950">
            {book.title}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        {...form.register("pagesReadInt", { valueAsNumber: true })}
      />
      <input
        type="date"
        className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none"
        {...form.register("date")}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" className="w-full">
          Log pages
        </Button>
        <span className="text-sm text-mint">{message}</span>
      </div>
    </form>
  );
}
