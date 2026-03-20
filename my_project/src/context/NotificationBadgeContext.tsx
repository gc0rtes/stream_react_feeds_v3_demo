import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Feed } from "@stream-io/feeds-client";
import { useUserContext } from "@/context/AuthContext";
import { useFeed } from "@/lib/stream/hooks";

type NotificationBadgeContextValue = {
  hasUnread: boolean;
  clearUnread: () => void;
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

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!feedsClient) return;

    const onNotificationFeedUpdated = () => {
      setHasUnread(true);
    };

    feedsClient.on("feeds.notification_feed.updated", onNotificationFeedUpdated);

    return () => {
      feedsClient.off(
        "feeds.notification_feed.updated",
        onNotificationFeedUpdated,
      );
    };
  }, [feedsClient]);

  const clearUnread = useCallback(() => {
    setHasUnread(false);
  }, []);

  const value = useMemo(
    () => ({
      hasUnread,
      clearUnread,
      notificationFeed,
      notificationFeedInitializing,
      notificationFeedError,
    }),
    [
      hasUnread,
      clearUnread,
      notificationFeed,
      notificationFeedInitializing,
      notificationFeedError,
    ],
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
      clearUnread: () => {},
      notificationFeed: null,
      notificationFeedInitializing: false,
      notificationFeedError: null,
    }
  );
}
