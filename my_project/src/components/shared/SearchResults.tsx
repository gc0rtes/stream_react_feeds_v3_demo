import React from "react";
import GridPostList from "./GridPostList";

type SearchResultsProps = {
  searchResults: any[];
};

const SearchResults = ({ searchResults }: SearchResultsProps) => {
  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <>
      {searchResults.map((activity) => (
        <GridPostList key={activity.id} post={activity} />
      ))}
    </>
  );
};

export default SearchResults;
