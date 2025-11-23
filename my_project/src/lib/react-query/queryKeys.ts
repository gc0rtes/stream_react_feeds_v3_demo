//this is a way to not misspell the query keys and
// catch the errors at compile time
export const QUERY_KEYS = {
  // AUTH KEYS
  CREATE_USER_ACCOUNT: "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER: "getCurrentUser",
  GET_USERS: "getUsers",
  GET_USER_BY_ID: "getUserById",

  // POST KEYS
  GET_POSTS: "getPosts",
  GET_INFINITE_POSTS: "getInfinitePosts",
  GET_RECENT_POSTS: "getRecentPosts",
  GET_POST_BY_ID: "getPostById",
  GET_USER_POSTS: "getUserPosts",
  GET_FILE_PREVIEW: "getFilePreview",
  GET_BOOKMARKED_ACTIVITIES: "getBookmarkedActivities",

  //  SEARCH KEYS
  SEARCH_POSTS: "getSearchPosts",

  // FOLLOW KEYS
  GET_FOLLOW_SUGGESTIONS: "getFollowSuggestions",
} as const;
