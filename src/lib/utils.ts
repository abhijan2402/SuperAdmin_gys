import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "Invalid Date";
  }
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export const getPermissionLabel = (permissions: string[]): string => {
  if (!permissions || permissions.length === 0) return "None";

  const permissionLabels: Record<string, string> = {
    read_access: "Read",
    write_access: "Write",
    delete_access: "Delete",
  };

  return permissions
    .map((perm: string) => permissionLabels[perm] || perm)
    .join(", ");
};
