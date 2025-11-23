import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetBookmarkedActivities } from "@/lib/react-query/queriesAndMutations";

const Saved = () => {
  const { feedsClient } = useUserContext();
  const { data: bookmarksData, isPending: isLoading } =
    useGetBookmarkedActivities(feedsClient);
  console.log("Bookmarked activities>>>", bookmarksData);
  if (isLoading) return <Loader />;

  // Extract activities from bookmarks: each bookmark has an activity property
  const activities =
    bookmarksData?.pages.flatMap((page) =>
      page.bookmarks.map((bookmark) => bookmark.activity)
    ) || [];

  if (!bookmarksData || activities.length === 0)
    return <p className="text-light-4">No saved posts</p>;

  return <GridPostList posts={activities} showStats={false} />;
};

export default Saved;
