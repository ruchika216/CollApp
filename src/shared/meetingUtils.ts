import { Meeting } from '../types';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // Total milliseconds
}

export interface CountdownResult {
  timeLeft: TimeLeft;
  status: 'upcoming' | 'live' | 'completed' | 'starting_soon';
  displayText: string;
  isUrgent: boolean; // Within 24 hours
  isCritical: boolean; // Within 1 hour
}

export const calculateTimeLeft = (
  startTime: string,
  _endTime?: string,
): TimeLeft => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const timeDiff = start - now;

  if (timeDiff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    total: timeDiff,
  };
};

export const getMeetingCountdown = (meeting: Meeting): CountdownResult => {
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = meeting.endTime ? new Date(meeting.endTime) : null;

  // Check if meeting is currently live
  if (endTime && now >= startTime && now <= endTime) {
    const timeToEnd = endTime.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeToEnd / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);

    return {
      timeLeft: calculateTimeLeft(meeting.endTime!, meeting.endTime!),
      status: 'live',
      displayText:
        hoursLeft > 0
          ? `Live - ${hoursLeft}h ${minutesLeft % 60}m left`
          : `Live - ${minutesLeft}m left`,
      isUrgent: true,
      isCritical: true,
    };
  }

  // Check if meeting has ended
  if (now >= startTime) {
    return {
      timeLeft: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      },
      status: 'completed',
      displayText: 'Completed',
      isUrgent: false,
      isCritical: false,
    };
  }

  // Meeting is upcoming
  const timeLeft = calculateTimeLeft(meeting.startTime);
  const { days, hours, minutes, total } = timeLeft;

  // Determine urgency
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const oneHourInMs = 60 * 60 * 1000;
  const fifteenMinInMs = 15 * 60 * 1000;

  const isUrgent = total <= oneDayInMs;
  const isCritical = total <= oneHourInMs;

  let displayText = '';
  let status: CountdownResult['status'] = 'upcoming';

  if (total <= fifteenMinInMs) {
    if (minutes <= 0) {
      displayText = 'Starting now!';
      status = 'starting_soon';
    } else {
      displayText = `${minutes}m left`;
      status = 'starting_soon';
    }
  } else if (total <= oneHourInMs) {
    displayText = `${minutes}m left`;
  } else if (total <= oneDayInMs) {
    displayText = `${hours}h ${minutes}m left`;
  } else if (days === 1) {
    displayText = `1 day ${hours}h left`;
  } else {
    displayText = `${days} days left`;
  }

  return {
    timeLeft,
    status,
    displayText,
    isUrgent,
    isCritical,
  };
};

export const formatMeetingTime = (
  dateString: string,
  includeDate: boolean = true,
): string => {
  const date = new Date(dateString);
  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (!includeDate) {
    return timeString;
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const meetingDate = date.toISOString().split('T')[0];
  const todayDate = today.toISOString().split('T')[0];
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  let datePart = '';

  if (meetingDate === todayDate) {
    datePart = 'Today';
  } else if (meetingDate === yesterdayDate) {
    datePart = 'Yesterday';
  } else if (meetingDate === tomorrowDate) {
    datePart = 'Tomorrow';
  } else {
    datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }

  return `${datePart} at ${timeString}`;
};

export const getMeetingDuration = (
  startTime: string,
  endTime?: string,
): string => {
  if (!endTime) {
    return 'No end time';
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();

  if (durationMs <= 0) {
    return 'Invalid duration';
  }

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  } else {
    return `${minutes}m`;
  }
};

export const shouldShowNotification = (meeting: Meeting): boolean => {
  const countdown = getMeetingCountdown(meeting);

  // Show notification if meeting is starting in 15 minutes, 1 hour, or 1 day
  const { total } = countdown.timeLeft;
  const fifteenMin = 15 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  // Check if we're within notification windows (with 1 minute tolerance)
  const tolerance = 60 * 1000;

  return (
    (total <= fifteenMin + tolerance && total >= fifteenMin - tolerance) ||
    (total <= oneHour + tolerance && total >= oneHour - tolerance) ||
    (total <= oneDay + tolerance && total >= oneDay - tolerance) ||
    countdown.status === 'starting_soon'
  );
};

export const getNotificationTitle = (meeting: Meeting): string => {
  const countdown = getMeetingCountdown(meeting);

  switch (countdown.status) {
    case 'starting_soon':
      return 'Meeting Starting Soon!';
    case 'live':
      return 'Meeting is Live';
    case 'upcoming':
      if (countdown.isCritical) {
        return 'Meeting in 1 Hour';
      } else if (countdown.isUrgent) {
        return 'Meeting Tomorrow';
      } else {
        return 'Upcoming Meeting';
      }
    default:
      return 'Meeting Reminder';
  }
};

export const getNotificationMessage = (meeting: Meeting): string => {
  const countdown = getMeetingCountdown(meeting);
  const timeStr = formatMeetingTime(meeting.startTime);

  switch (countdown.status) {
    case 'starting_soon':
      return `"${meeting.title}" is starting in ${countdown.displayText.replace(
        ' left',
        '',
      )}`;
    case 'live':
      return `"${meeting.title}" is currently live`;
    case 'upcoming':
      return `"${meeting.title}" is scheduled for ${timeStr}`;
    default:
      return `"${meeting.title}" - ${countdown.displayText}`;
  }
};

export const filterUpcomingMeetings = (
  meetings: Meeting[],
  limit: number = 5,
): Meeting[] => {
  const now = new Date();

  return meetings
    .filter(meeting => {
      const startTime = new Date(meeting.startTime);
      return startTime > now && meeting.status === 'Scheduled';
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, limit);
};

export const filterTodaysMeetings = (meetings: Meeting[]): Meeting[] => {
  const today = new Date().toISOString().split('T')[0];

  return meetings
    .filter(meeting => {
      const meetingDate = new Date(meeting.startTime)
        .toISOString()
        .split('T')[0];
      return meetingDate === today;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
};

export const getMeetingStatusColor = (meeting: Meeting): string => {
  const countdown = getMeetingCountdown(meeting);

  switch (countdown.status) {
    case 'live':
      return '#4CAF50'; // Green
    case 'starting_soon':
      return '#FF9800'; // Orange
    case 'upcoming':
      if (countdown.isCritical) {
        return '#F44336'; // Red
      } else if (countdown.isUrgent) {
        return '#FF9800'; // Orange
      } else {
        return '#2196F3'; // Blue
      }
    case 'completed':
      return '#757575'; // Grey
    default:
      return '#2196F3'; // Blue
  }
};
