import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import RightSidebar from "@/components/shared/RightSidebar";
import PostCard from "@/components/shared/PostCard";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";

const Community = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  const {
    activities,
    is_loading,
    isInitializing,
    feed,
    loadNextPage,
    has_next_page,
  } = useFeedActivitiesWithProvider(
    feedsClient,
    "newGlobal",
    "community",
    isConnected && !!user_id,
  );

  const isLoadingInitial = isInitializing || (is_loading && !activities?.length);

  return (
    <FeedProviderWrapper feed={feed}>
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
            <h2 className="h3-bold md:h2-bold text-left w-full">Community</h2>
            {isLoadingInitial && !activities ? (
              <div className=" flex-center items-center justify-center w-full h-full">
                <Loader />
              </div>
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

export default Community;
