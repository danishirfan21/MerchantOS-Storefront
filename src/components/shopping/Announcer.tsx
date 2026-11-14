"use client";

import { useSyncExternalStore } from "react";
import { getAnnouncement, getServerAnnouncement, subscribeAnnouncements } from "@/lib/announcer";

/** Visually hidden polite live region for cart and wishlist updates. */
export function Announcer() {
  const { message, count } = useSyncExternalStore(subscribeAnnouncements, getAnnouncement, getServerAnnouncement);
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" data-testid="announcer">
      {message}
      {count % 2 === 1 ? " " : ""}
    </div>
  );
}
