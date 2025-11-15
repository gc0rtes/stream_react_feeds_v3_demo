import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  getFeedActivities,
  getPostById,
  removeBookmark,
  removeLike,
  UpdateActivityPartial,
} from "../stream/api";

import { QUERY_KEYS } from "./queryKeys";

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

// Create User Account
export const useCreateUserAccount = () => {
  //Create user account in the database
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

// Sign In Account
export const useSignInAccount = () => {
  //Sign in account in the database
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user.email, user.password),
  });
};

// Sign Out Account
export const useSignOutAccount = () => {
  //Sign in account in the database
  return useMutation({
    mutationFn: () => signOutAccount(),
  });
};

// Create Post
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

// Update Post
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
      // Invalidate the specific post query
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, variables.activity_id],
      });
      // Invalidate the recent posts query
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

// Get recent Posts
export const useGetRecentPosts = (
  feedsClient: FeedsClient,
  feedgroup: string,
  feed_id: string
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: () => getFeedActivities(feedsClient, feedgroup, feed_id),
    // enabled: !!feedsClient && !!feedgroup && !!feed_id,
  });
};

/* Add like to a post
we are storing everything in the cache so the next time you click 
on the GET_POST_BY_ID query, it will be refetched and 
you will see the new like count */
export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      addLike(params.feedsClient, params.activity_id),
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
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

//DELETE LIKE
export const useDeleteLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      feedsClient: FeedsClient;
      activity_id: string;
      type: string;
    }) => removeLike(params.feedsClient, params.activity_id, params.type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// SAVE POST
export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      bookmarkActivity(params.feedsClient, params.activity_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};
//Delete Saved Post
export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { feedsClient: FeedsClient; activity_id: string }) =>
      removeBookmark(params.feedsClient, params.activity_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};
