import { useUserContext } from "@/context/AuthContext";
import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";
import { Loader } from "lucide-react";

import PostCard from "@/components/shared/PostCard";

const Home = () => {
  const { user, feedsClient } = useUserContext();
  const user_id = user?.id;

  const {
    data: posts,
    isPending: isPostLoading,
    isError: isPostError,
  } = useGetRecentPosts(feedsClient!, "user", user_id!); //The non-null assertions (!) tell TypeScript that we're confident these values won't actually be null when used by the hook.
  console.log("posts>>>", posts);

  return (
    <div className="border border-red-500 flex flex-1">
      <div className="border border-blue-500 flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home</h2>
          {isPostLoading && !posts ? (
            <Loader className="h-4 w-4 animate-spin" />
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
