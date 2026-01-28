import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useOwnFollows } from "@stream-io/feeds-client/react-bindings";
import { useUserContext } from "@/context/AuthContext";
import { useFeed } from "@/lib/stream/hooks";
import { useMemo } from "react";
import { followUser, unfollowUser } from "@/lib/stream/api";

type PostHeaderProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: any;
  avatarSize?: string;
  showActions?: boolean;
  actions?: React.ReactNode;
  isFollowing?: boolean;
};

const PostHeader = ({
  post,
  avatarSize = "h-10 w-10 rounded-full lg:h-12 lg:w-12",
  showActions = false,
  actions,
}: PostHeaderProps) => {
  const { user, feedsClient, isConnected } = useUserContext();

  // Get the post owner's user feed
  const { feed: postOwnerFeed } = useFeed(
    feedsClient,
    "user",
    post?.user?.id,
    isConnected && !!post?.user?.id && user?.id !== post?.user?.id
  );

  // Check if current user follows the post owner
  const { own_follows } = useOwnFollows(postOwnerFeed ?? undefined) ?? {};

  const isFollowingUser = useMemo(() => {
    if (!own_follows || !postOwnerFeed) return false;
    // Check if there's a follow relationship where the source feed matches the current user's timeline
    return own_follows.length > 0;
  }, [own_follows, postOwnerFeed]);

  // Show follow/unfollow button if:
  // 1. Current user is not the post owner
  // 2. We have the necessary data
  // 3. User is connected
  const shouldShowFollowButton =
    user?.id && post?.user?.id && user.id !== post.user.id && isConnected;

  const handleFollow = () => {
    if (!feedsClient || !user.id || !post?.user.id) return;
    followUser(feedsClient, "timeline", user.id, post?.user.id);
    console.log("follow", user.id, post?.user.id);
  };

  const handleUnfollow = () => {
    if (!feedsClient || !user.id || !post?.user.id) return;
    unfollowUser(feedsClient, "timeline", user.id, post?.user.id);
    console.log("unfollow", user.id, post?.user.id);
  };
  return (
    <div className="flex justify-between items-center w-full">
      <Link
        to={`/profile/${post?.user.id}`}
        className="flex items-center gap-3"
      >
        <img
          src={
            post?.user.image ||
            post?.user.imageUrl ||
            "/assets/icons/profile-placeholder.svg"
          }
          alt="creator"
          className={avatarSize}
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              @{post?.user.name || post?.user.id}
            </p>
            {shouldShowFollowButton && (
              <>
                {!isFollowingUser ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFollow();
                    }}
                    className="text-[12px] text-light-3 font-normal hover:text-light-1 transition-colors cursor-pointer"
                  >
                    • Follow
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnfollow();
                    }}
                    className="text-[12px] text-light-3 font-normal hover:text-light-1 transition-colors cursor-pointer"
                  >
                    • Unfollow
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex-center gap-2 text-light-3 text-sm">
            <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
              {formatDate(post?.created_at)}
            </p>
            -
            <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
              {post?.custom.custom_location}
            </p>
          </div>
        </div>
      </Link>
      {showActions && actions && (
        <div className="flex items-center gap-4">{actions}</div>
      )}
    </div>
  );
};

export default PostHeader;
