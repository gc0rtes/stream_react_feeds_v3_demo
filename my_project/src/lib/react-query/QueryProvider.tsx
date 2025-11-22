import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { setupCacheInspector } from "./cacheUtils";

// Configure QueryClient with default options for better cache visibility
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes (you'll see it in DevTools)
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cached data is kept for 10 minutes after it becomes unused
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus (you'll see this in action in DevTools)
      refetchOnWindowFocus: true,
    },
  },
});

// Setup cache inspector for browser console (development only)
if (import.meta.env.DEV) {
  setupCacheInspector(queryClient);
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - Only shows in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
