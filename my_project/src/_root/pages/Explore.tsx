import GridPostList from "@/components/shared/GridPostList";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetRecentPosts,
  useGetSearchPosts,
} from "@/lib/react-query/queriesAndMutations";

const Explore = () => {
  const { user, feedsClient } = useUserContext();
  const user_id = user?.id;
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const { data: posts, isPending: isPostLoading } = useGetRecentPosts(
    feedsClient!,
    "foryou",
    user_id!
  ); //The non-null assertions (!) tell TypeScript that we're confident these values won't actually be null when used by the hook.
  console.log("posts>>>", posts);

  // Debounced search value - only trigger query after user stops typing
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // Debounce search - update debounced value after user stops typing for 500ms
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Search query - only runs when debouncedSearchValue has content
  const { data: searchResults, isPending: isSearchLoading } = useGetSearchPosts(
    feedsClient,
    debouncedSearchValue
  );

  // Show search results only when there's data from the response
  const shouldShowSearchResults =
    searchValue.trim().length > 0 &&
    searchResults &&
    searchResults.activities &&
    searchResults.activities.length > 0;

  // Show "End of Posts" message only if:
  // - Not searching AND
  // - Feed has been loaded AND
  // - No activities (posts) in the feed
  const shouldShowEndOfPosts =
    searchValue.trim().length === 0 &&
    !isPostLoading &&
    posts &&
    (!posts.activities || posts.activities.length === 0);

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
      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {searchValue.trim().length > 0 ? (
          isSearchLoading ? (
            <p className="text-light-4 mt-10 text-center w-full">
              Searching...
            </p>
          ) : shouldShowSearchResults ? (
            <SearchResults searchResults={searchResults.activities} />
          ) : (
            <p className="text-light-4 mt-10 text-center w-full">
              No posts found
            </p>
          )
        ) : shouldShowEndOfPosts ? (
          <p className="text-light-4 mt-10 text-center w-full ">End of Posts</p>
        ) : isPostLoading ? (
          <p className="text-light-4 mt-10 text-center w-full">Loading...</p>
        ) : (
          posts?.activities?.map((activity) => (
            <GridPostList key={activity.id} post={activity} />
          ))
        )}
      </div>
    </div>
  );
};

export default Explore;
