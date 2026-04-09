import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  } catch {
    return "—";
  }
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function parseGraphError(error: unknown): string {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (e.message && typeof e.message === "string") return e.message;
    if (e.error && typeof e.error === "object") {
      const inner = e.error as Record<string, unknown>;
      if (inner.message && typeof inner.message === "string")
        return inner.message;
    }
  }
  return "An unexpected error occurred";
}
