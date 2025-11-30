import { useInView } from "react-intersection-observer";
import GridPostList from "@/components/shared/GridPostList";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { useUserContext } from "@/context/AuthContext";
import { getSearchPosts } from "@/lib/stream/api";
import Loader from "@/components/shared/Loader";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import useDebounce from "@/hooks/useDebounce";
import type { QueryActivitiesResponse } from "@stream-io/feeds-client";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const { ref, inView } = useInView();

  const debouncedSearchValue = useDebounce(searchValue, 800);

  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  /* SEARCH */
  const [searchResults, setSearchResults] = useState<
    QueryActivitiesResponse | undefined
  >(undefined);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    if (!feedsClient || !debouncedSearchValue.trim()) {
      setSearchResults(undefined);
      return;
    }

    setIsSearchLoading(true);
    getSearchPosts(feedsClient, debouncedSearchValue)
      .then((results) => {
        setSearchResults(results);
        setIsSearchLoading(false);
      })
      .catch((error) => {
        console.error("Error searching posts:", error);
        setIsSearchLoading(false);
      });
  }, [feedsClient, debouncedSearchValue]);

  /* FORYOU FEEDS*/
  const {
    activities,
    is_loading,
    loadNextPage,
    has_next_page,
    isInitializing,
    feed,
  } = useFeedActivitiesWithProvider(
    feedsClient,
    "foryou",
    user_id || undefined,
    isConnected && !!user_id
  );

  // Use ref to track if we're currently loading to prevent infinite loops
  const isLoadingRef = useRef(false);
  const loadNextPageRef = useRef(loadNextPage);
  const lastNextValueRef = useRef<string | undefined>(undefined);

  // Keep ref updated with latest loadNextPage function
  useEffect(() => {
    loadNextPageRef.current = loadNextPage;
  }, [loadNextPage]);

  useEffect(() => {
    // Only load if:
    // 1. Element is in view
    // 2. No search is active
    // 3. Not currently loading
    // 4. Not already triggered a load
    // 5. We have activities (not initial load)
    // 6. There's actually a next page (check feed state directly)
    if (
      !inView ||
      searchValue ||
      is_loading ||
      isLoadingRef.current ||
      !activities ||
      activities.length === 0 ||
      !feed
    ) {
      return;
    }

    // Use has_next_page from the hook which is reactive and reliable
    // Also check the feed state to get the actual next value for tracking
    const feedState = feed.state.getLatestValue();
    const currentNext = feedState?.next;

    // Only proceed if has_next_page is true AND it's different from the last one
    // This prevents loading the same page multiple times
    if (has_next_page && currentNext !== lastNextValueRef.current) {
      console.log("Loading next page. Next value:", currentNext);
      isLoadingRef.current = true;
      lastNextValueRef.current = currentNext;

      // Preserve scroll position
      const scrollPosition =
        window.scrollY || document.documentElement.scrollTop;

      loadNextPageRef
        .current()
        .then(() => {
          console.log("Next page loaded successfully");
          isLoadingRef.current = false;
          // Restore scroll position after DOM update
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "instant",
            });
          });
        })
        .catch((error) => {
          console.error("Error loading next page:", error);
          isLoadingRef.current = false;
          // Reset the ref on error so we can retry
          lastNextValueRef.current = undefined;
        });
    } else if (!has_next_page) {
      // Update ref when there's no next page
      lastNextValueRef.current = undefined;
    }
  }, [inView, searchValue, is_loading, activities, feed, has_next_page]);

  // Reset loading ref when loading state changes
  useEffect(() => {
    if (!is_loading) {
      isLoadingRef.current = false;
    }
  }, [is_loading]);

  const isLoadingPosts = isInitializing || is_loading;

  const shouldShowSearchResults = searchValue.trim() !== "";
  const shouldShowPosts =
    !shouldShowSearchResults && activities && activities.length === 0;

  // Check if we've reached the end (no more pages and we have activities)
  // Use has_next_page from the hook which is reactive and reliable
  const hasReachedEnd =
    !shouldShowSearchResults &&
    !isInitializing &&
    !is_loading &&
    activities &&
    activities.length > 0 &&
    !has_next_page;

  // Debug: Log state to help diagnose
  useEffect(() => {
    if (feed && activities && activities.length > 0) {
      const feedState = feed.state.getLatestValue();
      console.log("Explore page state:", {
        has_next_page_from_hook: has_next_page,
        next_from_state: feedState?.next,
        hasReachedEnd,
        is_loading,
        isInitializing,
        activitiesCount: activities.length,
      });
    }
  }, [
    feed,
    has_next_page,
    hasReachedEnd,
    is_loading,
    isInitializing,
    activities,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="flex flex-col flex-1 items-center overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="max-w-5xl flex flex-col items-center w-full gap-6 md:gap-9">
        <h2 className="h3-bold md:h2-bold text-left w-full">search posts</h2>
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search posts"
            className="bg-dark-4 border-none placeholder:text-light-4 focus-visible:ring-0 focus-visible:ring-offset-0 ring-offset-0"
            value={searchValue}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="flex-between w-full max-w-5xl mt-16 mb-7 ">
        <h3 className="body-bold md:h3-bold text-left w-full">Popular Today</h3>
        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>
      <FeedProviderWrapper feed={feed}>
        <div className="flex flex-wrap gap-9 w-full max-w-5xl">
          {shouldShowSearchResults ? (
            <SearchResults
              isSearchLoading={isSearchLoading}
              searchResults={searchResults}
            />
          ) : isLoadingPosts ? (
            <div className="flex-center w-full h-full">
              <Loader />
            </div>
          ) : shouldShowPosts ? (
            <p className="text-light-4 mt-10 text-center w-full">
              End of posts
            </p>
          ) : (
            activities && <GridPostList posts={activities} />
          )}
        </div>
        {/* It renders A <div> with ref={ref} 
        (from useInView) to detect when it enters the viewport. 
         This is a way to know when the user has reached the bottom of the page 
         and we need to fetch the next page in the useEffect.
         Only show loader if we have a next page and we're not at the end
         */}
        {!shouldShowSearchResults &&
          activities &&
          activities.length > 0 &&
          !is_loading &&
          !isInitializing && (
            <>
              {has_next_page ? (
                <div ref={ref} className="mt-10">
                  <Loader />
                </div>
              ) : (
                <div className="mt-10 text-center w-full">
                  <p className="text-light-4">That's all for now</p>
                </div>
              )}
            </>
          )}
      </FeedProviderWrapper>
    </div>
  );
};

export default Explore;
