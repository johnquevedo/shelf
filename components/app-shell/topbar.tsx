"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, LogOut, Search, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";

export function Topbar({
  name,
  username,
  imageUrl,
  counters,
  notificationCount
}: {
  name: string;
  username: string;
  imageUrl?: string | null;
  counters: Array<{ label: string; value: string }>;
  notificationCount: number;
}) {
  const [query, setQuery] = useState("");
  const [optimisticNotificationCount, setOptimisticNotificationCount] = useState(notificationCount);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hideNotificationBadge = pathname.startsWith("/notifications");

  useEffect(() => {
    if (hideNotificationBadge) {
      setOptimisticNotificationCount(0);
      return;
    }

    setOptimisticNotificationCount(notificationCount);
  }, [hideNotificationBadge, notificationCount]);

  useEffect(() => {
    if (pathname.startsWith("/explore")) {
      setQuery(searchParams.get("q") ?? "");
      return;
    }

    setQuery("");
  }, [pathname, searchParams]);

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#0f1728]/90 px-4 py-4 backdrop-blur md:flex-nowrap md:gap-4 md:px-8">
      <form
        className="relative order-2 w-full md:order-1 md:flex-1"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = query.trim();
          router.push(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/35 focus:border-white/20 focus:outline-none"
          placeholder="Search for books, authors, friends, and more…"
        />
      </form>
      <div className="order-1 mr-auto hidden items-center gap-3 lg:order-2 lg:flex">
        {counters.map((counter) => (
          <div key={counter.label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{counter.label}</p>
            <p className="text-sm font-semibold text-white">{counter.value}</p>
          </div>
        ))}
      </div>
      <Link
        href="/notifications"
        className="order-1 relative rounded-full border border-white/10 bg-white/5 p-3 text-white md:order-3"
        onClick={() => setOptimisticNotificationCount(0)}
      >
        <Bell className="h-4 w-4" />
        {!hideNotificationBadge && optimisticNotificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-slate-950">
            {optimisticNotificationCount > 9 ? "9+" : optimisticNotificationCount}
          </span>
        ) : null}
      </Link>
      <Link
        href="/settings"
        className="order-1 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-left md:order-4 md:gap-3"
      >
        <Avatar name={name} imageUrl={imageUrl} className="h-9 w-9" />
        <div className="hidden pr-3 md:block">
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-white/40">@{username}</p>
        </div>
        <Settings className="hidden h-4 w-4 text-white/45 md:block" />
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="order-1 rounded-full border border-white/10 bg-white/5 p-3 text-white md:order-5"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}
