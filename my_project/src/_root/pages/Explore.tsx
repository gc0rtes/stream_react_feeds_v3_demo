import GridPostList from "@/components/shared/GridPostList";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import { useEffect, useState, type ChangeEvent } from "react";
import { useUserContext } from "@/context/AuthContext";
import { getSearchPosts } from "@/lib/stream/api";
import Loader from "@/components/shared/Loader";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";
import useDebounce from "@/hooks/useDebounce";
import type { QueryActivitiesResponse } from "@stream-io/feeds-client";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");

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
    "explore_pop",
    user_id || undefined,
    isConnected && !!user_id,
  );

  const isLoadingPosts = isInitializing || (is_loading && !activities?.length);

  const shouldShowSearchResults = searchValue.trim() !== "";
  const shouldShowPosts =
    !shouldShowSearchResults && activities && activities.length === 0;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
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
        {!shouldShowSearchResults && (
          <FeedLoadMoreFooter
            className="max-w-5xl"
            visible={Boolean(
              activities && activities.length > 0 && !isInitializing,
            )}
            hasNextPage={has_next_page}
            isLoading={is_loading}
            onLoadMore={loadNextPage}
          />
        )}
      </FeedProviderWrapper>
    </div>
  );
};

export default Explore;
