import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeleteSavedPost,
  useLikePost,
  useSavePost,
  useDeleteLike,
} from "@/lib/react-query/queriesAndMutations";
import Loader from "./shared/Loader";

type PostStatsProps = {
  post: any;
};

const PostStats = ({ post }: PostStatsProps) => {
  //check if if "some" reaction is a like return true or false
  const isLikedStream = post.own_reactions?.some(
    (reaction: any) => reaction.type === "like"
  );

  const isBookmarkedStream = !!post.own_bookmarks?.length; //if the post has bookmarks, return true, otherwise false

  const [isLiked, setIsLiked] = useState<boolean>(isLikedStream);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(isBookmarkedStream);

  // Sync local state with post prop when it changes (e.g., when navigating between screens)
  useEffect(() => {
    setIsLiked(isLikedStream);
    setIsBookmarked(isBookmarkedStream);
  }, [isLikedStream, isBookmarkedStream]);

  const { mutate: likePost, isPending: isLikingPost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSavedPost } =
    useDeleteSavedPost();
  const { mutate: deleteLike, isPending: isDeletingLike } = useDeleteLike();

  const { feedsClient } = useUserContext();

  const reactionCountStream = post.reaction_count;

  //handle the like and bookmark actions (check video at 4:21)

  const handleAddBookmark = () => {
    if (isBookmarked) {
      setIsBookmarked(false);
      deleteSavedPost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
    } else {
      setIsBookmarked(true);
      savePost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
    }
  };

  const handleAddLike = () => {
    if (isLiked) {
      setIsLiked(false);
      deleteLike({
        feedsClient: feedsClient!,
        activity_id: post.id,
        type: "like",
      });
    } else {
      setIsLiked(true);
      likePost({
        feedsClient: feedsClient!,
        activity_id: post.id,
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
          {isDeletingLike || isLikingPost ? (
            <Loader />
          ) : (
            <img
              src={
                isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"
              }
              alt="liked"
              width={20}
              height={20}
              className="cursor-pointer"
              onClick={handleAddLike}
            />
          )}

          {post.reaction_groups?.like?.count ? (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              {post.reaction_groups.like.count}
            </p>
          ) : (
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              {reactionCountStream}
            </p>
          )}
        </div>
        <div className="flex gap-2 mr-5">
          {isSavingPost || isDeletingSavedPost ? (
            <Loader />
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PostStats;
