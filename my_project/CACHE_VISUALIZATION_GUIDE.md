# React Query Cache Visualization Guide

## 🎯 Overview
This guide will help you understand and visualize how React Query's cache system works in your Instagram clone project.

## 🚀 Getting Started

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Open React Query DevTools
Once your app is running, you'll see a **floating React Query logo** in the bottom-left corner of your browser. Click it to open the DevTools panel.

Alternatively, you can:
- Press the floating button to toggle the DevTools
- The DevTools will show a panel at the bottom of your screen

## 📊 What You'll See in DevTools

### **Queries Tab** (Main View)
This shows all your cached queries in real-time:

#### Query States:
- **🟢 Fresh** - Data is still fresh (within 5 minutes)
- **🟡 Stale** - Data is stale but still cached
- **🔵 Fetching** - Currently fetching new data
- **🔴 Inactive** - Query is not being used by any component

#### Query Information:
- **Query Key** - The unique identifier (e.g., `["getRecentPosts"]`)
- **Status** - `fetching`, `success`, `error`, `pending`
- **Data Updated** - When the data was last updated
- **Data** - The actual cached data (expandable)

### **Mutations Tab**
Shows all mutation operations (create, update, delete posts, likes, etc.)

## 🔍 Observing Cache Behavior

### **Scenario 1: Initial Data Fetch**
1. Navigate to the **Home** page
2. Watch DevTools - you'll see:
   - `GET_RECENT_POSTS` query appears
   - Status changes: `pending` → `fetching` → `success`
   - Data gets cached

### **Scenario 2: Cache Hit (No Network Request)**
1. Navigate away from Home (go to Explore)
2. Navigate back to Home
3. Watch DevTools:
   - Query shows as **Fresh** (green)
   - No network request is made
   - Data loads instantly from cache

### **Scenario 3: Cache Invalidation**
1. Create a new post
2. Watch DevTools:
   - Mutation appears in **Mutations** tab
   - After success, `GET_RECENT_POSTS` query gets invalidated
   - Query automatically refetches
   - New data appears in cache

### **Scenario 4: Stale Data Refetch**
1. Wait 5+ minutes on a page
2. Switch to another tab and come back
3. Watch DevTools:
   - Query becomes **Stale** (yellow)
   - Automatically refetches in background
   - Updates cache with fresh data

### **Scenario 5: Infinite Query Pagination**
1. Navigate to **Home** page
2. Scroll down to load more posts
3. Watch DevTools:
   - `GET_INFINITE_POSTS` query shows multiple pages
   - Each page is cached separately
   - You can see all cached pages

## 🎓 Key Concepts to Observe

### **1. Query Keys**
Each query has a unique key. In your project:
- `["getRecentPosts"]` - Home feed
- `["getPostById", "activity_id"]` - Single post
- `["getInfinitePosts", "feedgroup", "feed_id"]` - Infinite scroll
- `["searchPosts"]` - Search results

### **2. Cache Invalidation**
When you:
- **Like a post** → Invalidates `GET_POST_BY_ID` and `GET_RECENT_POSTS`
- **Create a post** → Invalidates `GET_RECENT_POSTS`
- **Update a post** → Invalidates `GET_POST_BY_ID`
- **Delete a post** → Invalidates `GET_RECENT_POSTS`

Watch the cache get invalidated and refetched automatically!

### **3. Stale Time vs Garbage Collection Time**
- **Stale Time (5 min)**: Data is considered fresh for 5 minutes
- **GC Time (10 min)**: Unused data is kept for 10 minutes before being garbage collected

### **4. Background Refetching**
- When you switch tabs and come back, stale queries automatically refetch
- Watch the status change from `stale` → `fetching` → `success`

## 🛠️ DevTools Features

### **Inspecting Query Data**
1. Click on any query in the list
2. See detailed information:
   - Full query key
   - Current data
   - Observers (which components are using this query)
   - Timestamps

### **Manually Triggering Actions**
- **Refetch** - Manually refetch a query
- **Invalidate** - Mark query as stale
- **Reset** - Clear query from cache
- **Remove** - Delete query from cache

### **Filtering Queries**
- Use the search box to find specific queries
- Filter by status (fresh, stale, fetching, etc.)

## 📝 Practice Exercises

### Exercise 1: Cache Observation
1. Open DevTools
2. Navigate to Home → Explore → Home
3. Notice: Second visit to Home uses cache (no network request)

### Exercise 2: Invalidation Flow
1. Open DevTools
2. Like a post
3. Watch: Multiple queries get invalidated and refetched

### Exercise 3: Infinite Query
1. Open DevTools
2. Scroll on Home page
3. See: Multiple pages cached under same query key

### Exercise 4: Stale Data
1. Stay on a page for 5+ minutes
2. Switch tabs
3. Come back and watch automatic refetch

## 💡 Pro Tips

1. **Keep DevTools Open**: Always have it open while developing to see cache behavior
2. **Watch Network Tab**: Compare DevTools with browser Network tab to see when requests are made
3. **Check Observers**: See which components are using which queries
4. **Monitor Mutations**: Watch how mutations trigger cache invalidations

## 🔗 Related Files

- `src/lib/react-query/QueryProvider.tsx` - QueryClient configuration
- `src/lib/react-query/queriesAndMutations.ts` - All query definitions
- `src/lib/react-query/queryKeys.ts` - Query key constants

## 🎉 You're Ready!

Now you can see exactly how React Query manages your cache in real-time. This is incredibly useful for:
- Debugging cache issues
- Understanding performance optimizations
- Learning how data flows through your app
- Optimizing query strategies

Happy learning! 🚀

