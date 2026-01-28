import { useUserContext } from "@/context/AuthContext";
import { getFollowedUsers, unfollowUser } from "@/lib/stream/api";
import Loader from "@/components/shared/Loader";
import { useState, useEffect } from "react";

interface FollowData {
  id?: string;
  target_feed?:
    | {
        id?: string;
        feed_group_id?: string;
        feed_id?: string;
        feed?: string;
        created_by?: {
          id?: string;
          name?: string;
          image?: string;
        };
      }
    | string;
  target_feed_data?: {
    name?: string;
    image?: string;
  };
}

const AllUsers = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const [followedUsers, setFollowedUsers] = useState<FollowData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  useEffect(() => {
    if (!feedsClient || !user.id || !isConnected) return;

    setIsLoading(true);
    getFollowedUsers(feedsClient, user.id, 20)
      .then((data) => {
        if (data?.follows) {
          setFollowedUsers(data.follows);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading followed users:", error);
        setIsLoading(false);
      });
  }, [feedsClient, user.id, isConnected]);

  const handleUnfollow = async (targetFeedId: string) => {
    if (!feedsClient || !user.id) return;

    setIsUnfollowing(true);
    try {
      await unfollowUser(feedsClient, "timeline", user.id, targetFeedId);
      // Remove the user from the list
      setFollowedUsers((prev) =>
        prev.filter((follow) => {
          const feedId =
            typeof follow.target_feed === "object"
              ? follow.target_feed?.created_by?.id
              : undefined;
          return feedId !== targetFeedId;
        })
      );
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsUnfollowing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="h2-bold mb-6">People You Follow</h2>

      {isLoading ? (
        <div className="flex-center items-center justify-center w-full h-full py-10">
          <Loader />
        </div>
      ) : followedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedUsers.map((follow: FollowData) => {
            const targetFeedId =
              typeof follow.target_feed === "object"
                ? follow.target_feed?.created_by?.id
                : undefined;

            // Safely extract user info from target_feed or fallback to target_feed_data
            const userInfo =
              typeof follow.target_feed === "object" &&
              follow.target_feed?.created_by
                ? follow.target_feed.created_by
                : follow.target_feed_data || {};

            const key =
              typeof follow.target_feed === "object"
                ? follow.target_feed?.id || follow.id
                : follow.id;

            return (
              <div
                key={key}
                className="flex items-center gap-3 p-4 bg-dark-3 rounded-lg border border-dark-4 hover:border-dark-4/80 transition"
              >
                <img
                  src={
                    userInfo.image || "/assets/icons/profile-placeholder.svg"
                  }
                  alt={userInfo.name || "User"}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="body-bold truncate">
                    @{userInfo.name || "Unknown User"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (targetFeedId) {
                      handleUnfollow(targetFeedId);
                    }
                  }}
                  disabled={isUnfollowing || !targetFeedId}
                  className="text-[18px] text-light-3 font-normal hover:text-light-1 transition-colors cursor-pointer"
                >
                  Unfollow
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="small-regular text-light-3 text-center py-4">
          You are not following anyone yet
        </p>
      )}
    </div>
  );
};

export default AllUsers;
