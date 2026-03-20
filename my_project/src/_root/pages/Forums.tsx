import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import RightSidebar from "@/components/shared/RightSidebar";
import PostCard from "@/components/shared/PostCard";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";
import { addUserToFeed } from "@/lib/stream/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type View = "grid" | "feed";

const FORUM_CATEGORIES = [
  {
    id: "sports",
    label: "Sports",
    description: "Discuss games, teams & fitness",
  },
  {
    id: "music",
    label: "Music",
    description: "Share tracks, artists & playlists",
  },
  { id: "travel", label: "Travel", description: "Trips, tips & destinations" },
  { id: "food", label: "Food", description: "Recipes, restaurants & cooking" },
] as const;

export type ForumCategoryId = (typeof FORUM_CATEGORIES)[number]["id"];

const Forums = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;
  const [view, setView] = useState<View>("grid");
  const [selectedCategory, setSelectedCategory] =
    useState<ForumCategoryId | null>(null);

  const forumCategory = selectedCategory ?? undefined;
  const feedEnabled = isConnected && !!user_id && !!forumCategory;

  const {
    activities,
    is_loading,
    isInitializing,
    feed,
    feedError,
    refetchFeed,
    loadNextPage,
    has_next_page,
  } = useFeedActivitiesWithProvider(
    feedsClient,
    "forums",
    forumCategory,
    feedEnabled,
  );

  const [membershipError, setMembershipError] = useState<string | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipAttempted, setMembershipAttempted] = useState(false);

  const isLoadingInitial = isInitializing || (is_loading && !activities?.length);

  // Reset membership state when switching forum category
  useEffect(() => {
    setMembershipError(null);
    setMembershipAttempted(false);
    setMembershipLoading(false);
  }, [selectedCategory]);

  // When feed loads after we attempted membership, stop loading
  useEffect(() => {
    if (feed && membershipLoading) setMembershipLoading(false);
  }, [feed, membershipLoading]);

  // When refetch after membership still fails, stop loading
  useEffect(() => {
    if (feedError && membershipAttempted && membershipLoading) setMembershipLoading(false);
  }, [feedError, membershipAttempted, membershipLoading]);

  // Step 1: Feed failed (e.g. 403) → request membership, then refetch on 200 OK
  useEffect(() => {
    if (
      !feedError ||
      view !== "feed" ||
      !feedsClient ||
      !user_id ||
      !selectedCategory ||
      membershipAttempted
    )
      return;

    const err = feedError as { code?: number; message?: string; status?: number };
    console.log("[Stream feed error]", {
      code: err?.code,
      message: err?.message,
      raw: feedError,
    });

    setMembershipAttempted(true);
    setMembershipLoading(true);
    setMembershipError(null);

    addUserToFeed(feedsClient, "forums", selectedCategory, user_id)
      .then(() => {
        refetchFeed();
      })
      .catch((e) => {
        console.error("[Forums] addUserToFeed failed:", e);
        setMembershipError(e?.message ?? "Could not join forum. Please try again.");
        setMembershipLoading(false);
      });
  }, [feedError, view, feedsClient, user_id, selectedCategory, membershipAttempted, refetchFeed]);

  const handleRetryJoin = () => {
    if (!feedsClient || !user_id || !selectedCategory) return;
    setMembershipError(null);
    setMembershipLoading(true);
    addUserToFeed(feedsClient, "forums", selectedCategory, user_id)
      .then(() => refetchFeed())
      .catch((e) => {
        setMembershipError(e?.message ?? "Could not join forum. Please try again.");
        setMembershipLoading(false);
      });
  };

  const handleRetryLoadFeed = () => {
    setMembershipLoading(true);
    refetchFeed();
  };

  const handleCardClick = (forum: (typeof FORUM_CATEGORIES)[number]) => {
    console.log("Forum selected:", forum.id, forum.label);
    setSelectedCategory(forum.id);
    setView("feed");
  };

  const handleBackToGrid = () => {
    setView("grid");
    setSelectedCategory(null);
  };

  const selectedLabel =
    selectedCategory &&
    (FORUM_CATEGORIES.find((c) => c.id === selectedCategory)?.label ??
      selectedCategory);

  return (
    <FeedProviderWrapper feed={feed}>
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
            {view === "grid" ? (
              /* Grid view: only forum cards, no PostCard */
              <>
                <h2 className="h3-bold md:h2-bold text-left w-full">Forums</h2>
                <section className="w-full">
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose a forum
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    {FORUM_CATEGORIES.map((forum) => (
                      <li key={forum.id}>
                        <Card
                          role="button"
                          tabIndex={0}
                          className="cursor-pointer transition-colors bg-primary-500 hover:bg-primary-500/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-primary-500"
                          onClick={() => handleCardClick(forum)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleCardClick(forum);
                            }
                          }}
                        >
                          <CardContent className="py-4 text-light-1">
                            <h3 className="font-semibold">{forum.label}</h3>
                            <p className="text-sm text-light-2 mt-0.5">
                              {forum.description}
                            </p>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : (
              /* Feed view: back button + feed with PostCard only here */
              <>
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleBackToGrid}
                    aria-label="Back to forums"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </Button>
                  <h2 className="h3-bold md:h2-bold truncate">
                    {selectedLabel}
                  </h2>
                </div>
                {membershipError ? (
                  <div className="flex flex-col gap-3 py-4">
                    <p className="text-muted-foreground text-sm">{membershipError}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRetryJoin}
                      disabled={membershipLoading}
                    >
                      {membershipLoading ? "Joining…" : "Try again"}
                    </Button>
                  </div>
                ) : feedError && membershipAttempted && !membershipLoading ? (
                  <div className="flex flex-col gap-3 py-4">
                    <p className="text-muted-foreground text-sm">
                      Could not load forum after joining. Please try again or go back.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRetryLoadFeed}
                        disabled={membershipLoading}
                      >
                        {membershipLoading ? "Loading…" : "Retry"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBackToGrid}>
                        Back to forums
                      </Button>
                    </div>
                  </div>
                ) : feedError && (membershipLoading || !membershipAttempted) ? (
                  <div className="flex-center flex-col gap-3 py-6">
                    <Loader />
                    <p className="text-muted-foreground text-sm">
                      {membershipAttempted ? "Loading forum…" : "Requesting access…"}
                    </p>
                  </div>
                ) : isLoadingInitial && !activities ? (
                  <div className="flex-center items-center justify-center w-full h-full">
                    <Loader />
                  </div>
                ) : (
                  <>
                    <ul className="flex flex-col gap-9 w-full">
                      {activities?.length ? (
                        activities.map((activity) => (
                          <PostCard key={activity.id} post={activity} />
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm py-4">
                          No posts in this forum yet.
                        </p>
                      )}
                    </ul>
                    <FeedLoadMoreFooter
                      visible={Boolean(
                        activities &&
                          activities.length > 0 &&
                          !isInitializing,
                      )}
                      hasNextPage={has_next_page}
                      isLoading={is_loading}
                      onLoadMore={loadNextPage}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <RightSidebar />
      </div>
    </FeedProviderWrapper>
  );
};

export default Forums;
