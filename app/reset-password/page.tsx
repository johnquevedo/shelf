"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shelf</p>
        <h1 className="mt-4 font-display text-4xl">Reset your password</h1>
        <p className="mt-3 text-sm text-slate-500">
          Enter a new password for your account.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            setLoading(true);

            const response = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, password })
            });
            const payload = (await response.json()) as { error?: string };

            if (!response.ok) {
              setError(payload.error ?? "Unable to reset password.");
            } else {
              setMessage("Password updated. You can log in now.");
            }

            setLoading(false);
          }}
        >
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" variant="light" className="w-full" disabled={!token || loading}>
            {loading ? "Updating…" : "Reset password"}
          </Button>
        </form>
        <Link href="/?auth=login" className="mt-6 inline-block text-sm font-semibold text-slate-500">
          Back to log in
        </Link>
      </div>
    </main>
  );
}
