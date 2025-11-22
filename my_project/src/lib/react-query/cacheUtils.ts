/**
 * Cache Inspection Utilities
 * 
 * These utilities help you inspect React Query cache in the browser console.
 * 
 * Usage in browser console:
 *   window.queryCache.inspect() - See all cached queries
 *   window.queryCache.getQuery('getRecentPosts') - Get specific query
 *   window.queryCache.getCacheSize() - See cache size
 */

import { QueryClient } from "@tanstack/react-query";

export const setupCacheInspector = (queryClient: QueryClient) => {
  // Make queryClient available in browser console for inspection
  if (typeof window !== "undefined") {
    (window as any).queryCache = {
      /**
       * Inspect all cached queries
       */
      inspect: () => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        console.group("🔍 React Query Cache Inspection");
        console.log(`Total queries cached: ${queries.length}`);
        console.table(
          queries.map((query) => ({
            "Query Key": JSON.stringify(query.queryKey),
            "Status": query.state.status,
            "Is Stale": query.isStale(),
            "Data Updated": query.state.dataUpdatedAt
              ? new Date(query.state.dataUpdatedAt).toLocaleTimeString()
              : "Never",
            "Observers": query.getObserversCount(),
          }))
        );
        console.groupEnd();
        return queries;
      },

      /**
       * Get a specific query by key
       */
      getQuery: (key: string) => {
        const cache = queryClient.getQueryCache();
        const query = cache.find({ queryKey: [key] });
        
        if (query) {
          console.group(`📦 Query: ${key}`);
          console.log("Query Key:", query.queryKey);
          console.log("Status:", query.state.status);
          console.log("Is Stale:", query.isStale());
          console.log("Data:", query.state.data);
          console.log("Observers:", query.getObserversCount());
          console.log("Data Updated:", new Date(query.state.dataUpdatedAt).toLocaleString());
          console.groupEnd();
          return query;
        } else {
          console.warn(`Query "${key}" not found in cache`);
          return null;
        }
      },

      /**
       * Get cache size and statistics
       */
      getCacheSize: () => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        
        const stats = {
          totalQueries: queries.length,
          fresh: queries.filter((q) => !q.isStale()).length,
          stale: queries.filter((q) => q.isStale()).length,
          fetching: queries.filter((q) => q.state.status === "fetching").length,
          inactive: queries.filter((q) => q.getObserversCount() === 0).length,
        };

        console.group("📊 Cache Statistics");
        console.table(stats);
        console.groupEnd();
        return stats;
      },

      /**
       * Get all query keys
       */
      getQueryKeys: () => {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        const keys = queries.map((q) => q.queryKey);
        
        console.group("🔑 All Query Keys");
        keys.forEach((key) => console.log(JSON.stringify(key)));
        console.groupEnd();
        return keys;
      },

      /**
       * Clear all cache
       */
      clearAll: () => {
        queryClient.clear();
        console.log("✅ Cache cleared!");
      },

      /**
       * Get the QueryClient instance for advanced operations
       */
      client: queryClient,
    };

    console.log(
      "%c🎉 Cache Inspector Ready!",
      "color: green; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cTry these commands in the console:",
      "color: blue; font-size: 14px;"
    );
    console.log("  • window.queryCache.inspect() - See all queries");
    console.log("  • window.queryCache.getQuery('getRecentPosts') - Get specific query");
    console.log("  • window.queryCache.getCacheSize() - See cache statistics");
    console.log("  • window.queryCache.getQueryKeys() - List all query keys");
    console.log("  • window.queryCache.clearAll() - Clear all cache");
  }
};

