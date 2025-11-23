import { useInView } from "react-intersection-observer";
import GridPostList from "@/components/shared/GridPostList";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetInfinitePosts,
  useGetSearchPosts,
} from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";

import useDebounce from "@/hooks/useDebounce";

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const { ref, inView } = useInView();

  const debouncedSearchValue = useDebounce(searchValue, 500);

  const { user, feedsClient, isConnected } = useUserContext();
  const user_id = user?.id;

  /* SEARCH */
  const { data: searchResults, isPending: isSearchLoading } = useGetSearchPosts(
    feedsClient,
    debouncedSearchValue
  );
  console.log("searchResults>>>", searchResults);

  /* FORYOU FEEDS*/
  const {
    data: posts,
    isPending: isPostLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useGetInfinitePosts(
    feedsClient,
    "foryou",
    user_id || "",
    isConnected && !!user_id
  );
  console.log("posts>>>", posts);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  console.log("posts>>>", posts);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue.trim() !== "";
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts.pages.every((item) => item.activities.length === 0);

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
      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchLoading}
            searchedPosts={searchResults}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item.activities} />
          ))
        )}
      </div>
      {hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
