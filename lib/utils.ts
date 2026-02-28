import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24))).toString();
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function slugifyShelfName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function sumBy<T>(items: T[], selector: (item: T) => number) {
  return items.reduce((total, item) => total + selector(item), 0);
}
