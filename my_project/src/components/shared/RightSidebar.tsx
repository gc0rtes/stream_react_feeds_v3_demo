import { useUserContext } from "@/context/AuthContext";
import {
  getFollowSuggestions,
  followUser,
  unfollowUser,
} from "@/lib/stream/api";
import { Button } from "../ui/button";
import Loader from "./Loader";
import { useState, useEffect } from "react";

const RightSidebar = () => {
  const { user, feedsClient, isConnected } = useUserContext();
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  useEffect(() => {
    if (!feedsClient || !user.id || !isConnected) return;

    setIsLoadingSuggestions(true);
    getFollowSuggestions(feedsClient, 10)
      .then((data) => {
        setSuggestions(data);
        setIsLoadingSuggestions(false);
      })
      .catch((error) => {
        console.error("Error loading follow suggestions:", error);
        setIsLoadingSuggestions(false);
      });
  }, [feedsClient, user.id, isConnected]);

  const handleFollow = async (targetFeedId: string) => {
    if (!feedsClient || !user.id) return;

    const isCurrentlyFollowed = followedUsers.has(targetFeedId);

    if (isCurrentlyFollowed) {
      // Unfollow
      setIsUnfollowing(true);
      try {
        await unfollowUser(feedsClient, "timeline", user.id, targetFeedId);
        setFollowedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(targetFeedId);
          return newSet;
        });
      } catch (error) {
        console.error("Error unfollowing user:", error);
      } finally {
        setIsUnfollowing(false);
      }
    } else {
      // Follow
      setIsFollowing(true);
      try {
        await followUser(feedsClient, "timeline", user.id, targetFeedId);
        setFollowedUsers((prev) => new Set(prev).add(targetFeedId));
      } catch (error) {
        console.error("Error following user:", error);
      } finally {
        setIsFollowing(false);
      }
    }
  };

  // Extract user ID from feed identifier (format: "user:userId" or just the feed ID)
  const extractUserId = (feedId: string | undefined): string => {
    if (!feedId) return "";
    // Handle both "user:userId" format and just "userId" format
    return feedId.includes(":") ? feedId.split(":")[1] : feedId;
  };

  // Extract username from feed identifier or use name
  const extractUsername = (suggestion: any): string => {
    if (suggestion.username) return suggestion.username;
    const feedId = suggestion.feed || suggestion.fid || "";
    const userId = extractUserId(feedId);
    // Try to extract from name or use userId as fallback
    return suggestion.name
      ? suggestion.name.toLowerCase().replace(/\s+/g, "")
      : userId;
  };

  return (
    <aside className="hidden xl:flex px-6 py-10 flex-col min-w-[300px] bg-dark-2">
      <div className="flex flex-col gap-6">
        <h2 className="h3-bold">Popular </h2>

        {isLoadingSuggestions ? (
          <div className="flex-center items-center justify-center w-full h-full py-10">
            <Loader />
          </div>
        ) : suggestions?.suggestions && suggestions.suggestions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {suggestions.suggestions.map((suggestion: any) => {
              const feedId = suggestion.feed || suggestion.fid || "";
              const userId = extractUserId(feedId);
              const username = extractUsername(suggestion);
              const isFollowed = followedUsers.has(userId);
              const isProcessing = isFollowing || isUnfollowing;

              return (
                <div
                  key={feedId || userId}
                  className="flex items-center gap-3 p-4 bg-dark-3 rounded-lg border border-dark-4 hover:border-dark-4/80 transition"
                >
                  <img
                    src={
                      suggestion.image_url ||
                      suggestion.image ||
                      "/assets/icons/profile-placeholder.svg"
                    }
                    alt={suggestion.name || "User"}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="body-bold truncate">
                      {suggestion.name || "Unknown User"}
                    </p>
                    <p className="small-regular text-light-3 truncate">
                      @{username}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleFollow(userId)}
                    disabled={isProcessing}
                    variant={isFollowed ? "outline" : "default"}
                    size="sm"
                    className="shrink-0"
                  >
                    {isFollowed ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="small-regular text-light-3 text-center py-4">
            No suggestions available
          </p>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;
