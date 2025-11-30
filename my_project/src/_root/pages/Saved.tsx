import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { getBookmarkedActivities } from "@/lib/stream/api";
import { useEffect, useState } from "react";

const Saved = () => {
  const { feedsClient } = useUserContext();
  const [activities, setActivities] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial bookmarks when feedsClient is available
  useEffect(() => {
    if (!feedsClient) return;

    // Reset state when feedsClient changes to prevent duplicates
    setActivities([]);

    const loadBookmarks = async () => {
      setIsLoading(true);
      try {
        const response = await getBookmarkedActivities(feedsClient, undefined);
        if (response) {
          const newActivities = response.bookmarks.map(
            (bookmark: { activity: unknown }) => bookmark.activity
          );
          setActivities(newActivities);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [feedsClient]);

  if (isLoading && activities.length === 0) return <Loader />;

  if (activities.length === 0)
    return <p className="text-light-4">No saved posts</p>;

  return (
    <div className="flex flex-col flex-1 items-center overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="max-w-5xl flex flex-col items-center w-full gap-6 md:gap-9">
        <div className="flex items-center justify-start w-full gap-2">
          <img
            src="/assets/icons/bookmark.svg"
            alt="bookmark"
            width={24}
            height={24}
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
        </div>
        <GridPostList posts={activities} showStats={false} />
      </div>
    </div>
  );
};

export default Saved;
