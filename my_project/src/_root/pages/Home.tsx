import { useEffect, useMemo, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import RightSidebar from "@/components/shared/RightSidebar";
import PostCard from "@/components/shared/PostCard";
import { TimelineInterestOnboarding } from "@/components/shared/TimelineInterestOnboarding";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";

const timelineOnboardingKey = (userId: string) =>
  `stream_timeline_onboarding_done:${userId}`;
const timelineWeightsKey = (userId: string) =>
  `stream_timeline_interest_weights:${userId}`;

function readStoredTimelinePrefs(userId: string | undefined) {
  if (!userId || typeof window === "undefined") {
    return { onboardingDone: true as boolean, interestWeights: undefined };
  }
  const onboardingDone =
    localStorage.getItem(timelineOnboardingKey(userId)) === "1";
  let interestWeights: Record<string, number> | undefined;
  const raw = localStorage.getItem(timelineWeightsKey(userId));
  if (raw) {
    try {
      interestWeights = JSON.parse(raw) as Record<string, number>;
    } catch {
      interestWeights = undefined;
    }
  }
  return { onboardingDone, interestWeights };
}

const Home = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  const storedPrefs = useMemo(
    () => readStoredTimelinePrefs(user_id),
    [user_id],
  );

  const [prefsOverride, setPrefsOverride] = useState<{
    onboardingDone: boolean;
    interestWeights?: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    setPrefsOverride(null);
  }, [user_id]);

  const timelinePrefs = prefsOverride ?? storedPrefs;

  const timelineGetOrCreateOptions = useMemo(
    () =>
      timelinePrefs.interestWeights
        ? { interest_weights: timelinePrefs.interestWeights }
        : undefined,
    [timelinePrefs.interestWeights],
  );

  const { activities, is_loading, isInitializing, feed } =
    useFeedActivitiesWithProvider(
      feedsClient,
      "timeline",
      user_id || undefined,
      isConnected && !!user_id,
      timelineGetOrCreateOptions,
    );

  const isLoading = isInitializing || is_loading;

  const showInterestOnboarding =
    !!user_id &&
    !isLoading &&
    (activities?.length ?? 0) === 0 &&
    !timelinePrefs.onboardingDone;

  const handleInterestConfirm = (interest_weights: Record<string, number>) => {
    if (!user_id) return;
    localStorage.setItem(timelineOnboardingKey(user_id), "1");
    localStorage.setItem(
      timelineWeightsKey(user_id),
      JSON.stringify(interest_weights),
    );
    setPrefsOverride({
      onboardingDone: true,
      interestWeights: interest_weights,
    });
  };

  const showEmptyAfterOnboarding =
    !!user_id &&
    !isLoading &&
    timelinePrefs.onboardingDone &&
    (activities?.length ?? 0) === 0;

  return (
    <FeedProviderWrapper feed={feed}>
      <TimelineInterestOnboarding
        open={showInterestOnboarding}
        onConfirm={handleInterestConfirm}
      />
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
          <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
            <h2 className="h3-bold md:h2-bold text-left w-full">Home</h2>
            {isLoading && !activities ? (
              <div className=" flex-center items-center justify-center w-full h-full">
                <Loader />
              </div>
            ) : showEmptyAfterOnboarding ? (
              <p className="base-regular text-light-4 w-full text-center">
                No posts yet. Check back later or explore other tabs.
              </p>
            ) : (
              <ul className="flex flex-col gap-9 w-full">
                {activities?.map((activity) => (
                  <PostCard key={activity.id} post={activity} />
                ))}
              </ul>
            )}
          </div>
        </div>
        <RightSidebar />
      </div>
    </FeedProviderWrapper>
  );
};

export default Home;
