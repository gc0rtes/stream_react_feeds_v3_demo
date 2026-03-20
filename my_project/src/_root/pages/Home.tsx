import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import RightSidebar from "@/components/shared/RightSidebar";
import PostCard from "@/components/shared/PostCard";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";

const HOME_FEED_TABS = [
  { id: "my_feed" as const, label: "My feed", feedGroup: "my_feed" },
  { id: "timeline" as const, label: "Timeline", feedGroup: "timeline" },
  { id: "user" as const, label: "Posted", feedGroup: "user" },
];

type HomeFeedTabId = (typeof HOME_FEED_TABS)[number]["id"];

const Home = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  const [activeTab, setActiveTab] = useState<HomeFeedTabId>("my_feed");
  const activeFeedGroup =
    HOME_FEED_TABS.find((t) => t.id === activeTab)?.feedGroup ?? "my_feed";
  const isMyFeedTab = activeFeedGroup === "my_feed";

  const {
    activities,
    is_loading,
    isInitializing,
    feed,
    loadNextPage,
    has_next_page,
  } = useFeedActivitiesWithProvider(
    feedsClient,
    activeFeedGroup,
    user_id || undefined,
    isConnected && !!user_id,
  );

  const isLoadingInitial = isInitializing || (is_loading && !activities?.length);
  const isEmpty =
    !isLoadingInitial && (activities?.length ?? 0) === 0;

  return (
    <FeedProviderWrapper feed={feed}>
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
            <h2 className="h3-bold md:h2-bold text-left w-full">Home</h2>
            <div
              className="flex w-full gap-1 rounded-lg border border-dark-4 bg-dark-3 p-1"
              role="tablist"
              aria-label="Home feed"
            >
              {HOME_FEED_TABS.map((tab) => {
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
                      selected
                        ? "bg-dark-4 text-light-1 shadow-sm"
                        : "text-light-4 hover:text-light-2"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {isLoadingInitial && !activities ? (
              <div className=" flex-center items-center justify-center w-full h-full">
                <Loader />
              </div>
            ) : isEmpty && isMyFeedTab ? (
              <p className="base-regular text-light-4 w-full text-center leading-relaxed">
                Nothing here yet.{" "}
                <Link
                  to="/explore"
                  className="text-primary-500 underline-offset-2 hover:underline"
                >
                  Go to Explore
                </Link>{" "}
                and like some posts — they&apos;ll show up in My feed.
              </p>
            ) : isEmpty ? (
              <p className="base-regular text-light-4 w-full text-center">
                No posts yet.
              </p>
            ) : (
              <>
                <ul className="flex flex-col gap-9 w-full">
                  {activities?.map((activity) => (
                    <PostCard key={activity.id} post={activity} />
                  ))}
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
          </div>
        </div>
        <RightSidebar />
      </div>
    </FeedProviderWrapper>
  );
};

export default Home;
