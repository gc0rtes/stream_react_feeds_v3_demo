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
  removeBookmark,
} from "../stream/api";

import { QUERY_KEYS } from "./queryKeys";

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
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.id],
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

// SAVE POST
export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      feedsClient: FeedsClient;
      activity_id: string;
      folder_id: string;
    }) =>
      bookmarkActivity(
        params.feedsClient,
        params.activity_id,
        params.folder_id
      ),
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
