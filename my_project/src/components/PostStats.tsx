import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeleteSavedPost,
  useLikePost,
  useSavePost,
  useDeleteLike,
} from "@/lib/react-query/queriesAndMutations";

type PostStatsProps = {
  post: any;
};

const PostStats = ({ post }: PostStatsProps) => {
  //check if if "some" reaction is a like retunr boolean value
  const isLikedStream = post.own_reactions?.some(
    (reaction: any) => reaction.type === "like"
  );
  const reactionCountStream = post.reaction_count;

  const isBookmarkedStream = post.own_bookmarks?.length > 0;

  const [isLiked, setIsLiked] = useState<boolean>(isLikedStream);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(isBookmarkedStream);
  const [reactionCount, setReactionCount] =
    useState<number>(reactionCountStream);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavedPost } = useDeleteSavedPost();
  const { mutate: deleteLike } = useDeleteLike();

  const { feedsClient } = useUserContext();

  console.log("reactionCountStream>>>", reactionCountStream);
  console.log("reactionCount>>>", reactionCount);
  console.log("isLikedStream>>>", isLikedStream);
  console.log("isLiked>>>", isLiked);
  console.log("isBookmarkedStream>>>", isBookmarkedStream);
  console.log("isBookmarked>>>", isBookmarked);

  //handle local state for the post stats
  // useEffect(() => {

  //   if (post.own_reactions?.find((reaction: any) => reaction.type === "like")) {
  //     setIsLiked(true);
  //   }
  //   console.log("isLiked>>>", isLiked);

  //   if (post.own_bookmarks?.length > 0) {
  //     setIsBookmarked(true);
  //   }
  //   console.log("bookmarks>>>", isBookmarked);
  // }, []);

  //handle the like and bookmark actions (check video at 4:21)

  const handleAddBookmark = () => {
    if (isBookmarked) {
      setIsBookmarked(false);
      const deletedSavedPost = deleteSavedPost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
      console.log("deletedSavedPost>>>", deletedSavedPost);
    } else {
      setIsBookmarked(true);
      const savedPost = savePost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
      console.log("savedPost>>>", savedPost);
    }
  };

  const handleAddLike = () => {
    if (isLiked) {
      setIsLiked(false);
      const deletedLike = deleteLike({
        feedsClient: feedsClient!,
        activity_id: post.id,
        type: "like",
      });
      console.log("deletedLike>>>", deletedLike);
      setReactionCount(reactionCount - 1);
      console.log("reactionCount>>>", reactionCount);
    } else {
      setIsLiked(true);
      console.log("isLiked>>>", isLiked);
      const addedLike = likePost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
      console.log("addedLike>>>", addedLike);
      setReactionCount(reactionCount + 1);
      console.log("reactionCount>>>", reactionCount);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
          <img
            src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="liked"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={handleAddLike}
          />

          {post.reaction_groups?.like?.count ? (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              {post.reaction_groups.like.count}
            </p>
          ) : (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              {reactionCount}
            </p>
          )}
        </div>
        <div className="flex gap-2 mr-5">
          <img
            src={
              isBookmarked
                ? "/assets/icons/saved.svg"
                : "/assets/icons/save.svg"
            }
            alt="saved"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={handleAddBookmark}
          />
        </div>
      </div>
    </div>
  );
};

export default PostStats;
