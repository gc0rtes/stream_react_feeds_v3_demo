import { useUserContext } from "@/context/AuthContext";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";

import PostCard from "@/components/shared/PostCard";

const Home = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  const { data: posts, isPending: isPostLoading } = useGetRecentPosts(
    feedsClient,
    "user",
    user_id || "",
    isConnected && !!user_id
  );
  console.log("posts>>>", posts);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home</h2>
          {isPostLoading && !posts ? (
            <div className=" flex-center items-center justify-center w-full h-full">
              <Loader />
            </div>
          ) : (
            <ul className="flex flex-col gap-9 w-full">
              {posts?.activities?.map((activity) => (
                <PostCard key={activity.id} post={activity} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
