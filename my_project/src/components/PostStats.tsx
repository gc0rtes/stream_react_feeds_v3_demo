import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  addLike,
  removeLike,
  bookmarkActivity,
  removeBookmark,
} from "@/lib/stream/api";
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
  const [isLikingPost, setIsLikingPost] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingSavedPost, setIsDeletingSavedPost] = useState(false);
  const [isDeletingLike, setIsDeletingLike] = useState(false);

  // Sync local state with post prop when it changes (e.g., when navigating between screens)
  useEffect(() => {
    setIsLiked(isLikedStream);
    setIsBookmarked(isBookmarkedStream);
  }, [isLikedStream, isBookmarkedStream]);

  const { feedsClient } = useUserContext();

  const reactionCountStream = post.reaction_count;

  //handle the like and bookmark actions
  // Note: State updates automatically via WebSocket, so we just need to call the API

  const handleAddBookmark = async () => {
    if (!feedsClient) return;

    if (isBookmarked) {
      setIsDeletingSavedPost(true);
      try {
        await removeBookmark(feedsClient, post.id);
        setIsBookmarked(false);
      } catch (error) {
        console.error("Error removing bookmark:", error);
      } finally {
        setIsDeletingSavedPost(false);
      }
    } else {
      setIsSavingPost(true);
      try {
        await bookmarkActivity(feedsClient, post.id);
        setIsBookmarked(true);
      } catch (error) {
        console.error("Error adding bookmark:", error);
      } finally {
        setIsSavingPost(false);
      }
    }
  };

  const handleAddLike = async () => {
    if (!feedsClient) return;

    if (isLiked) {
      setIsDeletingLike(true);
      try {
        await removeLike(feedsClient, post.id, "like");
        setIsLiked(false);
      } catch (error) {
        console.error("Error removing like:", error);
      } finally {
        setIsDeletingLike(false);
      }
    } else {
      setIsLikingPost(true);
      try {
        await addLike(feedsClient, post.id);
        setIsLiked(true);
      } catch (error) {
        console.error("Error adding like:", error);
      } finally {
        setIsLikingPost(false);
      }
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
