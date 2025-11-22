# Infinite Query Usage Example

## What is an Infinite Query?

An **infinite query** is a React Query feature that allows you to:
- Load data in **pages** (batches)
- Automatically fetch the next page when needed
- Maintain all loaded pages in cache
- Provide loading states for initial load and subsequent pages

## How It Works

1. **First Load**: Fetches the first page of data
2. **Pagination**: Uses the `next` cursor from the API response to fetch subsequent pages
3. **Data Structure**: Stores all pages in `data.pages` array
4. **Flattening**: You flatten `data.pages` to display all items together

## Example: Using in Home Component

```tsx
import { useUserContext } from "@/context/AuthContext";
import { useGetInfinitePosts } from "@/lib/react-query/queriesAndMutations";
import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import PostCard from "@/components/shared/PostCard";

const Home = () => {
  const { user, feedsClient } = useUserContext();
  const user_id = user?.id;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useGetInfinitePosts(feedsClient!, "user", user_id!);

  // Flatten all pages into a single array of activities
  const allActivities = data?.pages.flatMap((page) => page.activities || []) || [];

  // Infinite scroll: Load more when user scrolls to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className="max-w-screen-sm flex flex-col items-center w-full gap-6 md:gap-9">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home</h2>
          
          {isPending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : isError ? (
            <p>Error loading posts</p>
          ) : (
            <>
              <ul className="flex flex-col gap-9 w-full">
                {allActivities.map((activity) => (
                  <PostCard key={activity.id} post={activity} />
                ))}
              </ul>
              
              {/* Load more trigger */}
              <div ref={loadMoreRef} className="w-full">
                {isFetchingNextPage && (
                  <Loader className="h-4 w-4 animate-spin mx-auto" />
                )}
                {!hasNextPage && allActivities.length > 0 && (
                  <p className="text-center text-light-4">No more posts</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
```

## Key Properties from useInfiniteQuery

- **`data.pages`**: Array of all loaded pages
- **`data.pageParams`**: Array of page parameters used
- **`fetchNextPage()`**: Function to load the next page
- **`hasNextPage`**: Boolean indicating if more pages are available
- **`isFetchingNextPage`**: Boolean indicating if next page is currently loading
- **`isPending`**: Boolean for initial loading state

## Manual "Load More" Button Alternative

If you prefer a button instead of infinite scroll:

```tsx
<button
  onClick={() => fetchNextPage()}
  disabled={!hasNextPage || isFetchingNextPage}
  className="..."
>
  {isFetchingNextPage ? "Loading..." : "Load More"}
</button>
```

