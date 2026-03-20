import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Feed } from "@stream-io/feeds-client";
import { useNotificationStatus } from "@stream-io/feeds-react-sdk";
import { useUserContext } from "@/context/AuthContext";
import { useFeed } from "@/lib/stream/hooks";

type NotificationBadgeContextValue = {
  /** True when the notification feed reports unread items (initial load + realtime updates). */
  hasUnread: boolean;
  notificationFeed: Feed | null;
  notificationFeedInitializing: boolean;
  notificationFeedError: unknown;
};

const NotificationBadgeContext = createContext<
  NotificationBadgeContextValue | undefined
>(undefined);

export function NotificationFeedProvider({ children }: { children: ReactNode }) {
  const { feedsClient, user, isConnected } = useUserContext();
  const userId = user?.id;
  const enabled = Boolean(feedsClient && isConnected && userId);

  const {
    feed: notificationFeed,
    isInitializing: notificationFeedInitializing,
    feedError: notificationFeedError,
  } = useFeed(
    feedsClient,
    "notification",
    userId || undefined,
    enabled,
  );

  const { unread = 0 } = useNotificationStatus(notificationFeed ?? undefined) ?? {};
  const hasUnread = unread > 0;

  const value = useMemo(
    () => ({
      hasUnread,
      notificationFeed,
      notificationFeedInitializing,
      notificationFeedError,
    }),
    [hasUnread, notificationFeed, notificationFeedInitializing, notificationFeedError],
  );

  return (
    <NotificationBadgeContext.Provider value={value}>
      {children}
    </NotificationBadgeContext.Provider>
  );
}

export function useNotificationBadge() {
  const ctx = useContext(NotificationBadgeContext);
  return (
    ctx ?? {
      hasUnread: false,
      notificationFeed: null,
      notificationFeedInitializing: false,
      notificationFeedError: null,
    }
  );
}
