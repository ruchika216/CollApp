/**
 * Utility functions for formatting and calculations
 */

/**
 * Convert a timestamp to a human-readable "time ago" format
 * @param timestamp - Date object, Firestore timestamp, or date string
 * @returns Human-readable time ago string
 */
export const getTimeAgo = (timestamp: any): string => {
  const now = new Date();
  const targetTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - targetTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(diffInMinutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  if (hours < 48) {
    return 'Yesterday';
  }
  
  return targetTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};