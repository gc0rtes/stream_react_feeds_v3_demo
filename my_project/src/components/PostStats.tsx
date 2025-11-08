import { useUserContext } from "@/context/AuthContext";
import { addLike, pinActivity, removeLike } from "@/lib/stream/api";

const PostStats = ({ post }: { post: any }) => {
  const { feedsClient } = useUserContext();

  return (
    <div>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
          {post.own_reactions[0]?.type === "like" ? (
            <img
              src="/assets/icons/liked.svg"
              alt="liked"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => removeLike(feedsClient!, post.id)}
            />
          ) : (
            <img
              src="/assets/icons/like.svg"
              alt="like"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={() => addLike(feedsClient!, post.id)}
            />
          )}

          {post.reaction_groups?.like?.count ? (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              {post.reaction_groups.like.count}
            </p>
          ) : (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              0
            </p>
          )}
        </div>
        <div className="flex gap-2 mr-5">
          <img
            src="/assets/icons/save.svg"
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() =>
              pinActivity(
                feedsClient!,
                post.id,
                post.current_feed.group_id,
                post.current_feed.id
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PostStats;
