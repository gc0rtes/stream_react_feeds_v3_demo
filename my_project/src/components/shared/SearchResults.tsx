import type { QueryActivitiesResponse } from "@stream-io/feeds-client";
import GridPostList from "./GridPostList";
import Loader from "@/components/shared/Loader";

type SearchResultsProps = {
  searchResults: QueryActivitiesResponse | undefined;
  isSearchLoading: boolean;
};

const SearchResults = ({
  searchResults,
  isSearchLoading,
}: SearchResultsProps) => {
  if (isSearchLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (
    !searchResults ||
    !searchResults.activities ||
    searchResults.activities.length === 0
  ) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4 mt-10 text-center w-full">
          No results found
        </p>
      </div>
    );
  }

  return <GridPostList posts={searchResults.activities} />;
};

export default SearchResults;
