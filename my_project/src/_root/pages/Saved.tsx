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
