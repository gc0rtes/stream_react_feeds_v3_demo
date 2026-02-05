import { useEffect, useState } from "react";
import type { Feed, FeedsClient } from "@stream-io/feeds-client";
import { useFeedActivities, StreamFeed } from "@stream-io/feeds-react-sdk";

/**
 * Hook to initialize and get a feed instance with watch enabled
 */
export function useFeed(
  feedsClient: FeedsClient | null,
  feedGroup: string,
  feedId: string | undefined,
  enabled: boolean = true
) {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [feedError, setFeedError] = useState<unknown>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  useEffect(() => {
    if (!feedsClient || !feedId || !enabled) {
      setFeed(null);
      setFeedError(null);
      return;
    }

    setFeedError(null);
    setIsInitializing(true);
    const feedInstance = feedsClient.feed(feedGroup, feedId);

    feedInstance
      .getOrCreate({ watch: true })
      .then(() => {
        setFeed(feedInstance);
        setFeedError(null);
        setIsInitializing(false);
      })
      .catch((error) => {
        console.error("Error initializing feed:", error);
        setFeedError(error);
        setFeed(null);
        setIsInitializing(false);
      });
  }, [feedsClient, feedGroup, feedId, enabled, refetchCount]);

  const refetchFeed = () => setRefetchCount((c) => c + 1);

  return { feed, isInitializing, feedError, refetchFeed };
}

/**
 * Hook to get feed activities with automatic updates
 */
export function useFeedActivitiesWithProvider(
  feedsClient: FeedsClient | null,
  feedGroup: string,
  feedId: string | undefined,
  enabled: boolean = true
) {
  const { feed, isInitializing, feedError, refetchFeed } = useFeed(
    feedsClient,
    feedGroup,
    feedId,
    enabled
  );
  const feedActivities = useFeedActivities(feed ?? undefined);

  return {
    ...feedActivities,
    isInitializing,
    feed,
    feedError,
    refetchFeed,
  };
}

/**
 * Component wrapper for StreamFeed
 */
export function FeedProviderWrapper({
  feed,
  children,
}: {
  feed: Feed | null;
  children: React.ReactNode;
}) {
  if (!feed) {
    return <>{children}</>;
  }

  return <StreamFeed feed={feed}>{children}</StreamFeed>;
}
