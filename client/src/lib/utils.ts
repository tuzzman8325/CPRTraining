import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string as a local date to avoid timezone conversion issues.
 * When using new Date("2025-09-15"), it treats the date as UTC midnight,
 * which in timezones west of UTC becomes the previous day.
 * This function ensures the date is parsed as local date.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Note: month is 0-indexed in JavaScript Date constructor
  return new Date(year, month - 1, day);
}
