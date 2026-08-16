const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

/** Turns an ISO timestamp into a short label suitable for a note preview. */
export function formatRelativeTime(timestamp: string, now = Date.now()) {
  const date = new Date(timestamp).getTime();
  if (Number.isNaN(date)) {
    return "";
  }

  const elapsed = Math.max(0, now - date);
  if (elapsed < MINUTE) {
    return "Just now";
  }

  const units = [
    [MONTH, "month"],
    [WEEK, "week"],
    [DAY, "day"],
    [HOUR, "hour"],
    [MINUTE, "minute"],
  ] as const;

  for (const [milliseconds, label] of units) {
    if (elapsed >= milliseconds) {
      const count = Math.floor(elapsed / milliseconds);
      return `${count} ${label}${count === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
}
