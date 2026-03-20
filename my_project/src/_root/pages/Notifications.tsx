import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { AggregatedActivityResponse } from "@stream-io/feeds-client";
import { useAggregatedActivities } from "@stream-io/feeds-react-sdk";
import { useUserContext } from "@/context/AuthContext";
import { useNotificationBadge } from "@/context/NotificationBadgeContext";
import Loader from "@/components/shared/Loader";
import { FeedProviderWrapper } from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";

function formatRelativeTime(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function AggregatedNotificationRow({
  item,
}: {
  item: AggregatedActivityResponse;
}) {
  const latest = item.activities[0];
  if (!latest) return null;

  const others = item.user_count > 1 ? item.user_count - 1 : 0;
  const preview =
    latest.text?.trim().slice(0, 100) ||
    latest.type ||
    "Activity on your post";

  return (
    <li className="rounded-xl border border-dark-4 bg-dark-3 transition-colors hover:bg-dark-4/60">
      <Link
        to={`/post/${latest.id}`}
        className="flex gap-4 p-4 text-left"
      >
        <img
          src={latest.user?.image || "/assets/icons/profile-placeholder.svg"}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-light-1">
            <span className="font-semibold">{latest.user?.name || "Someone"}</span>
            {others > 0 ? (
              <span className="text-light-3">
                {" "}
                and {others} other{others === 1 ? "" : "s"}
              </span>
            ) : null}
            <span className="text-light-3"> · {latest.type}</span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-light-4">{preview}</p>
          <p className="mt-2 text-xs text-light-4">
            {formatRelativeTime(new Date(item.updated_at))}
          </p>
        </div>
      </Link>
    </li>
  );
}

function NotificationFeedList({
  isInitializing,
  feedError,
}: {
  isInitializing: boolean;
  feedError: unknown;
}) {
  const data = useAggregatedActivities();

  const isLoadingInitial =
    isInitializing ||
    (Boolean(data?.is_loading) && (data?.aggregated_activities?.length ?? 0) === 0);

  if (feedError) {
    return (
      <p className="base-regular mt-6 text-center text-red-500">
        Could not load notifications. Please try again later.
      </p>
    );
  }

  if (isLoadingInitial && !data?.aggregated_activities?.length) {
    return (
      <div className="flex-center py-16">
        <Loader />
      </div>
    );
  }

  const items = data?.aggregated_activities ?? [];

  if (items.length === 0) {
    return (
      <p className="base-regular mt-10 text-center text-light-4">
        No notifications yet. Likes, follows, and reactions will show up here.
      </p>
    );
  }

  return (
    <>
      <ul className="flex w-full flex-col gap-3">
        {items.map((item) => (
          <AggregatedNotificationRow
            key={`${item.group}-${item.updated_at?.toString?.() ?? ""}`}
            item={item}
          />
        ))}
      </ul>
      <FeedLoadMoreFooter
        visible={Boolean(items.length > 0 && !isInitializing)}
        hasNextPage={data?.has_next_page}
        isLoading={data?.is_loading}
        onLoadMore={() => data?.loadNextPage() ?? Promise.resolve()}
      />
    </>
  );
}

const Notifications = () => {
  const { feedsClient, user } = useUserContext();
  const {
    clearUnread,
    notificationFeed: feed,
    notificationFeedInitializing: isInitializing,
    notificationFeedError: feedError,
  } = useNotificationBadge();

  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  return (
    <div className="flex flex-1 flex-col items-center overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
      <div className="flex w-full max-w-screen-sm flex-col gap-6">
        <h1 className="h3-bold md:h2-bold text-left w-full text-light-1">
          Notifications
        </h1>
        {!feedsClient || !user?.id ? (
          <p className="base-regular text-center text-light-4">
            Connect to your account to see notifications.
          </p>
        ) : feedError && !feed ? (
          <p className="base-regular text-center text-red-500">
            Could not load notifications. Please try again later.
          </p>
        ) : !feed && isInitializing ? (
          <div className="flex-center py-16">
            <Loader />
          </div>
        ) : feed ? (
          <FeedProviderWrapper feed={feed}>
            <NotificationFeedList
              isInitializing={isInitializing}
              feedError={feedError}
            />
          </FeedProviderWrapper>
        ) : (
          <p className="base-regular text-center text-light-4">
            Notifications are unavailable right now.
          </p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
