import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

// ============================================================
// CLASS NAME UTILITY
// ============================================================

/** Merges Tailwind classes safely with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ============================================================
// DATE FORMATTERS
// ============================================================

/**
 * Formats a date string into a readable date string.
 * Example: "29 May 2026"
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy')
}

/**
 * Formats a date relative to now.
 * Example: "3 hours ago", "2 days ago"
 */
export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

/**
 * Formats a message timestamp for chat display.
 * - Today → "14:35"
 * - Yesterday → "Yesterday 14:35"
 * - Older → "29 May"
 */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  if (isToday(date)) {
    return format(date, 'HH:mm')
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`
  }
  return format(date, 'd MMM')
}

// ============================================================
// FILE SIZE FORMATTER
// ============================================================

/**
 * Converts bytes to a human-readable file size string.
 * Example: formatFileSize(2500000) → "2.4 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(index > 0 ? 1 : 0)} ${units[index]}`
}

// ============================================================
// STRING HELPERS
// ============================================================

/**
 * Truncates a string to the given length, appending "…" if cut.
 */
export function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len).trimEnd() + '…'
}

/**
 * Generates initials from a full name.
 * "Ayana Singh" → "AS"
 * "Bob" → "B"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validates a scholar number — must be exactly 6 digits.
 * Matches the database constraint: scholar_number ~ '^\d{6}$'
 */
export function isValidScholarNumber(sn: string): boolean {
  return /^\d{6}$/.test(sn)
}

// ============================================================
// RATE LIMIT CONSTANTS
// ============================================================

/** Max general chat messages per day for non-unlimited users */
export const GENERAL_CHAT_LIMIT = 30

/** Max Yufi AI queries per day for non-unlimited users */
export const YUFI_DAILY_LIMIT = 30

/** Max Yufi AI queries per day for "unlimited" users (hard cap to prevent abuse) */
export const YUFI_UNLIMITED_LIMIT = 100
