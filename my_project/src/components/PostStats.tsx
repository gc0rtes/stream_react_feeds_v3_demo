import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeleteSavedPost,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queriesAndMutations";
import {
  addLike,
  bookmarkActivity,
  removeBookmark,
  removeLike,
} from "@/lib/stream/api";

type PostStatsProps = {
  post: any;
};

const PostStats = ({ post }: PostStatsProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavedPost } = useDeleteSavedPost();

  const { feedsClient, user } = useUserContext();

  useEffect(() => {
    if (post.reaction_count) {
      setReactionCount(post.reaction_count);
    }
    console.log("reactionCount>>>", reactionCount);
  }, []);

  //Check if the post is already liked and bookmarked by the user
  useEffect(() => {
    if (post.own_reactions?.find((reaction: any) => reaction.type === "like")) {
      setIsLiked(true);
    }
    console.log("isLiked>>>", isLiked);
  }, []);

  useEffect(() => {
    if (post.own_bookmarks?.length > 0) {
      setIsBookmarked(true);
    }
    console.log("bookmarks>>>", isBookmarked);
  }, []);

  const handleAddBookmark = () => {
    bookmarkActivity(feedsClient!, post.id);
    setIsBookmarked(true);
  };

  const handleAddLike = () => {
    addLike(feedsClient!, post.id);
    setIsLiked(true);
    setReactionCount(reactionCount + 1);
  };

  const handleRemoveBookmark = () => {
    removeBookmark(feedsClient!, post.id);
    setIsBookmarked(false);
    console.log("marking post as not bookmarked>>>");
  };

  const handleRemoveLike = () => {
    removeLike(feedsClient!, post.id);
    setIsLiked(false);
    setReactionCount(reactionCount - 1);
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
            onClick={isLiked ? handleRemoveLike : handleAddLike}
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
            onClick={isBookmarked ? handleRemoveBookmark : handleAddBookmark}
          />
        </div>
      </div>
    </div>
  );
};

export default PostStats;
