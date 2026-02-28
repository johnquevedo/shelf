"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/validators/auth";

type Values = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shelf</p>
        <h1 className="mt-4 font-display text-4xl">Reset your password</h1>
        <p className="mt-3 text-sm text-slate-500">
          Enter the email on your account and Shelf will send you a password reset email.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            const response = await fetch("/api/auth/forgot-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values)
            });

            const payload = (await response.json()) as { message?: string };
            setMessage(payload.message ?? "If your account exists, a reset link was generated.");
          })}
        >
          <Input type="email" placeholder="you@example.com" {...form.register("email")} />
          <p className="text-xs text-rose-500">{form.formState.errors.email?.message}</p>
          <Button type="submit" variant="light" className="w-full">
            Send reset email
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-slate-500">
          Back to home
        </Link>
      </div>
    </main>
  );
}
