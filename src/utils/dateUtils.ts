import { firebase } from '@react-native-firebase/firestore';

export const getFirebaseTimestamp = (date?: Date) => {
  if (date) {
    return firebase.firestore.Timestamp.fromDate(date);
  }
  return firebase.firestore.Timestamp.now();
};

export const formatDate = (date?: Date | string | null) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date?: Date | string | null) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDatePast = (dateString?: string | Date | null) => {
  if (!dateString) return false;

  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();

  // Set hours, minutes, seconds, and milliseconds to 0 for date comparison
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return dateOnly < nowOnly;
};

export const getDaysUntil = (dateString?: string | Date | null) => {
  if (!dateString) return 0;

  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();

  // Set hours, minutes, seconds, and milliseconds to 0 for date comparison
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = dateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
