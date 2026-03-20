import GridPostList from "@/components/shared/GridPostList";
import SearchResults from "@/components/shared/SearchResults";
import { Input } from "@/components/ui/input";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useUserContext } from "@/context/AuthContext";
import { getSearchPosts } from "@/lib/stream/api";
import Loader from "@/components/shared/Loader";
import {
  useFeedActivitiesWithProvider,
  FeedProviderWrapper,
} from "@/lib/stream/hooks";
import { FeedLoadMoreFooter } from "@/components/shared/FeedLoadMoreFooter";
import useDebounce from "@/hooks/useDebounce";
import type {
  ActivityResponse,
  QueryActivitiesResponse,
} from "@stream-io/feeds-client";

function formatTopicLabel(tag: string) {
  return tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Explore = () => {
  const [searchValue, setSearchValue] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filterContainerRef = useRef<HTMLDivElement>(null);
  const initialPageLengthRef = useRef<number | null>(null);
  const extractedTopicsRef = useRef(false);

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

  useEffect(() => {
    if (isInitializing) {
      initialPageLengthRef.current = null;
      extractedTopicsRef.current = false;
      setTopicOptions([]);
      setSelectedTopic(null);
      setFilterMenuOpen(false);
      return;
    }
    if (initialPageLengthRef.current === null) {
      initialPageLengthRef.current = activities?.length ?? 0;
    }
  }, [isInitializing, activities]);

  useEffect(() => {
    if (isInitializing || extractedTopicsRef.current || !activities?.length) {
      return;
    }

    let pageLen = initialPageLengthRef.current ?? 0;
    if (pageLen === 0) {
      pageLen = activities.length;
      initialPageLengthRef.current = pageLen;
    }

    extractedTopicsRef.current = true;
    const firstPage = activities.slice(0, pageLen);
    const tags = new Set<string>();
    for (const a of firstPage) {
      const arr = (a as ActivityResponse).interest_tags;
      if (!Array.isArray(arr)) continue;
      for (const t of arr) {
        if (typeof t === "string" && t.trim()) tags.add(t.trim());
      }
    }
    setTopicOptions([...tags].sort((x, y) => x.localeCompare(y)));
  }, [isInitializing, activities]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = filterContainerRef.current;
      if (!el || !filterMenuOpen) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [filterMenuOpen]);

  const filteredActivities = useMemo(() => {
    if (!activities?.length || !selectedTopic) return activities;
    return activities.filter((a) =>
      (a as ActivityResponse).interest_tags?.includes(selectedTopic),
    );
  }, [activities, selectedTopic]);

  const isLoadingPosts = isInitializing || (is_loading && !activities?.length);

  const shouldShowSearchResults = searchValue.trim() !== "";
  const shouldShowPosts =
    !shouldShowSearchResults && activities && activities.length === 0;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const showTopicFilter = !shouldShowSearchResults;

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
        {showTopicFilter ? (
          <div className="relative shrink-0" ref={filterContainerRef}>
            <button
              type="button"
              className="flex-center gap-3 rounded-xl bg-dark-3 px-4 py-2 text-light-2 hover:bg-dark-4/80"
              onClick={() => setFilterMenuOpen((o) => !o)}
              aria-expanded={filterMenuOpen}
              aria-haspopup="listbox"
            >
              <p className="small-medium md:base-medium">
                {selectedTopic ? formatTopicLabel(selectedTopic) : "All"}
              </p>
              <img
                src="/assets/icons/filter.svg"
                width={20}
                height={20}
                alt=""
              />
            </button>
            {filterMenuOpen && (
              <ul
                className="absolute right-0 top-full z-30 mt-2 min-w-[200px] max-h-64 overflow-y-auto rounded-lg border border-dark-4 bg-dark-3 py-1 shadow-lg"
                role="listbox"
              >
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedTopic === null}
                    className="w-full px-4 py-2.5 text-left text-sm text-light-2 hover:bg-dark-4"
                    onClick={() => {
                      setSelectedTopic(null);
                      setFilterMenuOpen(false);
                    }}
                  >
                    All
                  </button>
                </li>
                {topicOptions.length === 0 ? (
                  <li className="px-4 py-2.5 text-sm text-light-4">
                    No topics on first page
                  </li>
                ) : (
                  topicOptions.map((topic) => (
                    <li key={topic}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedTopic === topic}
                        className="w-full px-4 py-2.5 text-left text-sm text-light-2 hover:bg-dark-4"
                        onClick={() => {
                          setSelectedTopic(topic);
                          setFilterMenuOpen(false);
                        }}
                      >
                        {formatTopicLabel(topic)}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        ) : null}
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
          ) : filteredActivities && filteredActivities.length === 0 ? (
            <p className="text-light-4 mt-10 text-center w-full">
              No posts with this topic. Try another or choose All.
            </p>
          ) : (
            filteredActivities && (
              <GridPostList posts={filteredActivities} />
            )
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
