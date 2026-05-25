export function relativeTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';

  const diffMs = now.getTime() - t;
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return 'Now';

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24 && now.toDateString() === new Date(t).toDateString()) {
    return `${diffHr} hr${diffHr === 1 ? '' : 's'} ago`;
  }

  const dt = new Date(t);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const time = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dt.toDateString() === yesterday.toDateString()) return `Yesterday ${time}`;

  const sameYear = dt.getFullYear() === now.getFullYear();
  const dateStr = dt.toLocaleDateString(undefined, {
    month: 'short',
    day:   'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  return `${dateStr} ${time}`;
}
