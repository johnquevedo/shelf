"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, House, Library, LockKeyhole, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/home", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/journal", label: "Journal", icon: ScrollText },
  { href: "/library", label: "Library", icon: Library }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden h-screen w-[88px] flex-col justify-between border-r border-white/10 bg-[#09111f] px-4 py-6 text-white md:flex md:w-[280px]">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl">Shelf</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950">
                  Beta
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white",
                    active && "bg-white/10 text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 text-xs text-white/50">
          <Link href="/privacy" className="flex items-center gap-2 rounded-2xl px-4 py-2 hover:bg-white/10">
            <LockKeyhole className="h-4 w-4 shrink-0" />
            <span className="hidden md:block">Privacy</span>
          </Link>
          <Link href="/terms" className="block rounded-2xl px-4 py-2 hover:bg-white/10">
            <span className="hidden md:block">Terms</span>
            <span className="md:hidden">T</span>
          </Link>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#09111f]/95 px-2 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-white/60 transition",
                  active && "bg-white/10 text-white"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
