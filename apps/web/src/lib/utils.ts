import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to properly format relative time with timezone handling
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown';

  // Ensure we have a proper Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Unknown';
  }

  return formatDistanceToNow(dateObj, { addSuffix: false, locale: he });
}
