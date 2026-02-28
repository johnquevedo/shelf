"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "idle"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (response) => {
        const payload = (await response.json()) as { error?: string; email?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Verification failed.");
        }
        setStatus("success");
        setMessage(`Verified ${payload.email}. You can log in now.`);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      });
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shelf</p>
        <h1 className="mt-4 font-display text-4xl">Verify your email</h1>
        {token ? (
          <p className="mt-4 text-sm text-slate-600">
            {status === "loading" ? "Verifying your account…" : message}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Need a fresh verification link? Enter the email you signed up with.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setMessage("");
                const response = await fetch("/api/auth/resend-verification", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email })
                });
                const payload = (await response.json()) as { message?: string; error?: string };
                setMessage(payload.message ?? payload.error ?? "Unable to send verification email.");
              }}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
              <Button type="submit" variant="light" className="w-full">
                Resend verification
              </Button>
            </form>
            {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
          </>
        )}
        <div className="mt-6 flex gap-3">
          <Link href="/" className="text-sm font-semibold text-slate-500">
            Back to home
          </Link>
          {status === "success" ? (
            <Link href="/?auth=login" className="text-sm font-semibold text-slate-950">
              Log in
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
