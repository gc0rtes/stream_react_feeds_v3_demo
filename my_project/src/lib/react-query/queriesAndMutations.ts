import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { INewUser, IUploadedFile } from "@/types";
import type { FeedsClient } from "@stream-io/feeds-client";

import {
  createUserAccount,
  signInAccount,
  signOutAccount,
} from "../appwrite/api";

import {
  AddActivity,
  addLike,
  bookmarkActivity,
  deleteActivity,
  getFeedActivities,
  getPostById,
  removeBookmark,
  removeLike,
  getSearchPosts,
  UpdateActivityPartial,
} from "../stream/api";

import { QUERY_KEYS } from "./queryKeys";

/* USER MANAGEMENT */

export const useCreateUserAccount = () => {
  //Create user account in the database
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  //Sign in account in the database
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user.email, user.password),
  });
};

export const useSignOutAccount = () => {
  //Sign in account in the database
  return useMutation({
    mutationFn: () => signOutAccount(),
  });
};

/* ACTIVITY MANAGEMENT */

/** GET RECENT POSTS */
export const useGetRecentPosts = (
  feedsClient: FeedsClient | null,
  feedgroup: string,
  feed_id: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS, feedgroup, feed_id],
    queryFn: () => getFeedActivities(feedsClient!, feedgroup, feed_id),
    enabled: enabled && !!feedsClient && !!feedgroup && !!feed_id,
  });
};

/** GET INFINITE POSTS */
export const useGetInfinitePosts = (
  feedsClient: FeedsClient | null,
  feedgroup: string,
  feed_id: string,
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS, feedgroup, feed_id],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      getFeedActivities(feedsClient!, feedgroup, feed_id, pageParam),
    initialPageParam: undefined as string | undefined, // First page doesn't need a cursor
    getNextPageParam: (lastPage) => {
      // Return the next cursor if it exists, otherwise return undefined to stop pagination
      return lastPage?.next || undefined;
    },
    enabled: enabled && !!feedsClient && !!feedgroup && !!feed_id,
  });
};

/** GET POST BY ID */
export const useGetPostById = (
  feedsClient: FeedsClient,
  activity_id: string
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, activity_id],
    queryFn: () => getPostById(feedsClient, activity_id),
    enabled: !!activity_id, //we want to fetch the post only if the activity_id is another id
  });
};

/** SEARCH POSTS */
export const useGetSearchPosts = (
  feedsClient: FeedsClient | null,
  searchQuery: string
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchQuery],
    queryFn: () => getSearchPosts(feedsClient!, searchQuery),
    //Uses enabled to refetch when the search term changes
    enabled: !!feedsClient && !!searchQuery,
  });
};

/** CREATE POST */
type CreatePostParams = {
  feedsClient: FeedsClient;
  feedgroup: string;
  feed_id: string;
  text: string;
  uploadedFiles: IUploadedFile[];
  custom_location?: string;
  interest_tags?: string;
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreatePostParams) =>
      AddActivity(
        params.feedsClient,
        params.feedgroup,
        params.feed_id,
        params.text,
        params.uploadedFiles,
        params.custom_location,
        params.interest_tags
      ),
    // Triggers refetches when data changes
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

/** UPDATE POST */
type UpdatePostParams = {
  feedsClient: FeedsClient;
  activity_id: string;
  text: string;
  uploadedFiles: IUploadedFile[];
  custom_location?: string;
  interest_tags?: string;
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdatePostParams) =>
      UpdateActivityPartial(
        params.feedsClient,
        params.activity_id,
        params.text,
        params.uploadedFiles,
        params.custom_location,
        params.interest_tags
      ),
    // Triggers refetches when data changes
    onSuccess: (_data, variables) => {
      // In case we update a post, we need to be able to refetch the post if we go the
      // post page to see the updated post.
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
    },
  });
};

/* DELETE POST */
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      deleteActivity(params.feedsClient, params.activity_id),

    //In case we delete a post, we need to be able to refetch all
    // posts in the home page to show all the new posts without the deleted one.
    // This is because we are storing everything in the cache so the next time you load the HomePage,
    // the GET_RECENT_POSTS query will be refetched and you will see the new posts without
    // the deleted one.
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS, variables.activity_id],
      });
    },
  });
};

/* POST ACTIONS */

/** ADD LIKE TO A POST */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      addLike(params.feedsClient, params.activity_id),

    // You need to invalidate the corresponding view whenever you add/remove a like
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SEARCH_POSTS],
      });
    },
  });
};

/** DELETE LIKE */
export const useDeleteLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      feedsClient: FeedsClient;
      activity_id: string;
      type: string;
    }) => removeLike(params.feedsClient, params.activity_id, params.type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SEARCH_POSTS],
      });
    },
  });
};

/** SAVE POST */
export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      bookmarkActivity(params.feedsClient, params.activity_id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SEARCH_POSTS],
      });
    },
  });
};
/** DELETE SAVED POST */
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      removeBookmark(params.feedsClient, params.activity_id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SEARCH_POSTS],
      });
    },
  });
};
