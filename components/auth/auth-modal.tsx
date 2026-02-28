"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("auth");
  const open = mode === "login" || mode === "signup";
  const isSignup = mode === "signup";
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const activeForm = useMemo(() => (isSignup ? registerForm : loginForm), [isSignup, loginForm, registerForm]);
  const emailField = isSignup ? registerForm.register("email") : loginForm.register("email");
  const passwordField = isSignup ? registerForm.register("password") : loginForm.register("password");
  const emailError = isSignup
    ? registerForm.formState.errors.email?.message
    : loginForm.formState.errors.email?.message;
  const passwordError = isSignup
    ? registerForm.formState.errors.password?.message
    : loginForm.formState.errors.password?.message;

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    router.replace(`/?${params.toString()}`.replace(/\?$/, ""));
  };

  const submit = activeForm.handleSubmit(async (values) => {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (isSignup) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values)
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error || "Unable to create account");
        }

        setInfo("Account created. Check your email to verify your account before logging in.");
        return;
      }

      const checkResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      const checkPayload = (await checkResponse.json()) as { error?: string };
      if (!checkResponse.ok) {
        throw new Error(checkPayload.error || "Unable to continue");
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/home"
      });

      if (result?.error) {
        throw new Error("Unable to log in.");
      }

      router.push("/home");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close();
        }
      }}
      title={isSignup ? "Create your Shelf account" : "Welcome back"}
      description={
        isSignup
          ? "Start building shelves, writing reviews, and tracking your reading."
          : "Sign in to continue reading with your circle."
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        {isSignup ? (
          <div>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <Input id="signup-name" placeholder="Ava Monroe" {...registerForm.register("name")} />
            <p className="mt-1 text-xs text-rose-500">{registerForm.formState.errors.name?.message}</p>
          </div>
        ) : null}
        <div>
          <label htmlFor="auth-email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <Input id="auth-email" type="email" placeholder="you@example.com" {...emailField} />
          <p className="mt-1 text-xs text-rose-500">{emailError}</p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            {!isSignup ? (
              <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-slate-950">
                Forgot password?
              </Link>
            ) : null}
          </div>
          <Input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            {...passwordField}
          />
          <p className="mt-1 text-xs text-rose-500">{passwordError}</p>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {info ? <p className="text-sm text-emerald-700">{info}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Working…" : isSignup ? "Sign Up" : "Log In"}
        </Button>
        {!isSignup ? (
          <Link href="/verify-email" className="block text-center text-sm text-slate-500 hover:text-slate-950">
            Resend verification email
          </Link>
        ) : null}
      </form>
    </Modal>
  );
}
