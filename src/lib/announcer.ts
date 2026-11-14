/** Tiny store feeding the polite live region, so cart changes are announced to screen readers. */
type Announcement = { message: string; count: number };

const EMPTY: Announcement = { message: "", count: 0 };
let current: Announcement = EMPTY;
const listeners = new Set<() => void>();

export function announce(message: string) {
  current = { message, count: current.count + 1 };
  listeners.forEach((listener) => listener());
}

export function subscribeAnnouncements(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAnnouncement(): Announcement {
  return current;
}

export function getServerAnnouncement(): Announcement {
  return EMPTY;
}
