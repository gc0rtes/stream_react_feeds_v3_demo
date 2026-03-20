import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type {
  ActivityResponse,
  AggregatedActivityResponse,
} from "@stream-io/feeds-client";
import {
  useAggregatedActivities,
  useFeedContext,
  useIsAggregatedActivityRead,
} from "@stream-io/feeds-react-sdk";
import { ChevronDown } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { useNotificationBadge } from "@/context/NotificationBadgeContext";
import Loader from "@/components/shared/Loader";
import { FeedProviderWrapper } from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";
import { cn } from "@/lib/utils";

const GROUP_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Matches aggregation: `{target_id}_{type}_{YYYY-MM-DD}`.
 * If `target_id` contains underscores, everything before the last two segments is the target id.
 */
function parseAggregationGroup(group: string): {
  targetId: string;
  activityType: string;
  dateISO: string;
} | null {
  const parts = group.split("_");
  if (parts.length < 3) return null;
  const dateISO = parts[parts.length - 1] ?? "";
  const activityType = parts[parts.length - 2] ?? "";
  if (!GROUP_DATE_RE.test(dateISO)) return null;
  const targetId = parts.slice(0, -2).join("_");
  if (!targetId || !activityType) return null;
  return { targetId, activityType, dateISO };
}

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

function formatActivityTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ReadStateBadge({ isRead }: { isRead: boolean }) {
  const shell =
    "inline-flex min-w-[5.25rem] shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";
  if (isRead) {
    return (
      <span
        className={cn(
          shell,
          "border border-dark-4 bg-dark-2/80 text-light-3 ring-1 ring-transparent",
        )}
        aria-label="Read"
      >
        <span className="size-1.5 shrink-0 rounded-full bg-light-4" aria-hidden />
        Read
      </span>
    );
  }
  return (
    <span
      className={cn(
        shell,
        "border border-transparent bg-primary-500/25 text-primary-500 ring-1 ring-primary-500/40",
      )}
      aria-label="Unread"
    >
      <span className="size-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
      Unread
    </span>
  );
}

/** Newest groups first; stable when Stream reorders after mark_read. */
function sortAggregatedByNewestFirst(
  items: AggregatedActivityResponse[],
): AggregatedActivityResponse[] {
  return [...items].sort((a, b) => {
    const tb = b.updated_at.getTime();
    const ta = a.updated_at.getTime();
    if (tb !== ta) return tb - ta;
    return a.group.localeCompare(b.group);
  });
}

function getNotificationActivityPath(activity: ActivityResponse): string {
  const target = activity.notification_context?.target;
  if (target?.id) {
    const kind = (target.type ?? "").toLowerCase();
    if (kind === "user" || kind === "profile") {
      return `/profile/${target.id}`;
    }
    return `/post/${target.id}`;
  }
  return `/post/${activity.id}`;
}

function AggregatedNotificationGroupRow({
  item,
  expanded,
  onToggle,
}: {
  item: AggregatedActivityResponse;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isRead = useIsAggregatedActivityRead({ aggregatedActivity: item });
  const latest = item.activities[0];
  const parsed = parseAggregationGroup(item.group);
  const others = item.user_count > 1 ? item.user_count - 1 : 0;

  const groupTitle = parsed
    ? `${formatActivityTypeLabel(parsed.activityType)} · ${parsed.dateISO}`
    : "Notification group";

  const targetLine = parsed
    ? `Target ${parsed.targetId.length > 36 ? `${parsed.targetId.slice(0, 34)}…` : parsed.targetId}`
    : `Group ${item.group.length > 40 ? `${item.group.slice(0, 38)}…` : item.group}`;

  const summaryPreview =
    latest?.text?.trim().slice(0, 80) ||
    latest?.type ||
    "Open to see activity details";

  return (
    <li
      className={cn(
        "isolate overflow-hidden rounded-xl border border-dark-4 border-l-2 bg-dark-3 [contain:layout]",
        isRead ? "border-l-dark-4" : "border-l-primary-500",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full gap-3 p-4 text-left transition-colors hover:bg-dark-4/60"
      >
        <ChevronDown
          className={cn(
            "mt-0.5 size-5 shrink-0 text-light-3 transition-transform duration-200 motion-reduce:transition-none",
            expanded ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-light-1">{groupTitle}</p>
            <ReadStateBadge isRead={isRead} />
          </div>
          <p className="mt-0.5 text-xs text-light-3">{targetLine}</p>
          <p className="mt-2 text-sm text-light-1">
            <span className="font-semibold">{latest?.user?.name || "Someone"}</span>
            {others > 0 ? (
              <span className="text-light-3">
                {" "}
                and {others} other{others === 1 ? "" : "s"}
              </span>
            ) : null}
            <span className="text-light-3">
              {" "}
              · {item.activity_count} activit{item.activity_count === 1 ? "y" : "ies"}
            </span>
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-light-4">{summaryPreview}</p>
          <p className="mt-2 text-xs text-light-4">
            Updated {formatRelativeTime(new Date(item.updated_at))}
          </p>
        </div>
      </button>

      {expanded ? (
        <ul className="border-t border-dark-4 bg-dark-2/40 px-4 py-2 [overflow-anchor:none]">
          {item.activities.map((activity) => {
            const path = getNotificationActivityPath(activity);
            const preview =
              activity.text?.trim().slice(0, 120) ||
              activity.type ||
              "Notification";

            return (
              <li key={activity.id} className="border-b border-dark-4/80 last:border-0">
                <div className="flex gap-3 py-3">
                  <img
                    src={
                      activity.user?.image || "/assets/icons/profile-placeholder.svg"
                    }
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-full object-cover"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-light-1">
                      <span className="font-semibold">
                        {activity.user?.name || "Someone"}
                      </span>
                      <span className="text-light-3"> · {activity.type}</span>
                    </p>
                    <p className="mt-1 line-clamp-3 text-xs text-light-4">{preview}</p>
                    <p className="mt-2 text-xs text-light-4">
                      {formatRelativeTime(new Date(activity.created_at))}
                    </p>
                    <Link
                      to={path}
                      className="mt-2 inline-block text-xs font-medium text-primary-500 hover:underline"
                    >
                      View activity
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
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
  const feed = useFeedContext();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const markReadRequested = useRef(new Set<string>());

  const isLoadingInitial =
    isInitializing ||
    (Boolean(data?.is_loading) && (data?.aggregated_activities?.length ?? 0) === 0);

  const toggleGroup = useCallback(
    (group: string) => {
      setExpanded((prev) => {
        const nextOpen = !prev[group];
        if (
          nextOpen &&
          feed &&
          !markReadRequested.current.has(group)
        ) {
          markReadRequested.current.add(group);
          void feed.markActivity({ mark_read: [group] }).catch((err) => {
            markReadRequested.current.delete(group);
            console.error("Failed to mark notification group as read:", err);
          });
        }
        return { ...prev, [group]: nextOpen };
      });
    },
    [feed],
  );

  const items = useMemo(() => {
    const raw = data?.aggregated_activities ?? [];
    return sortAggregatedByNewestFirst(raw);
  }, [data?.aggregated_activities]);

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
          <AggregatedNotificationGroupRow
            key={item.group}
            item={item}
            expanded={Boolean(expanded[item.group])}
            onToggle={() => toggleGroup(item.group)}
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
    notificationFeed: feed,
    notificationFeedInitializing: isInitializing,
    notificationFeedError: feedError,
  } = useNotificationBadge();

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto overflow-x-hidden py-10 px-5 [overflow-anchor:none] md:px-8 lg:p-14 custom-scrollbar">
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
