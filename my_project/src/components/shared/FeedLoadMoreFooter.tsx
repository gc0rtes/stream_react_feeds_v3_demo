import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedLoadMoreFooterProps = {
  /** When false, nothing is rendered (e.g. no activities yet or still on initial load). */
  visible: boolean;
  hasNextPage?: boolean;
  isLoading?: boolean;
  onLoadMore: () => void | Promise<unknown>;
  className?: string;
};

export function FeedLoadMoreFooter({
  visible,
  hasNextPage,
  isLoading,
  onLoadMore,
  className,
}: FeedLoadMoreFooterProps) {
  if (!visible) return null;

  const loading = Boolean(isLoading);

  const handleLoadMore = () => {
    if (hasNextPage !== true || loading) return;
    void Promise.resolve(onLoadMore()).catch((error) => {
      console.error("Error loading next page:", error);
    });
  };

  return (
    <div
      className={cn(
        "mt-10 flex w-full flex-col items-center gap-4",
        className,
      )}
    >
      {hasNextPage === true ? (
        <Button
          type="button"
          variant="secondary"
          className="min-w-[140px] border-dark-4 bg-dark-4 text-light-1 hover:bg-dark-4/80"
          disabled={loading}
          onClick={handleLoadMore}
        >
          {loading ? "Loading…" : "Load more"}
        </Button>
      ) : (
        <p className="text-center text-light-4">That&apos;s all for now</p>
      )}
    </div>
  );
}
