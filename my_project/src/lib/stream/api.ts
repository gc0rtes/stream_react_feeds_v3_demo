import { FeedsClient } from "@stream-io/feeds-client";
import type { IUploadedFile, INewPost } from "@/types";

// deleteImage
export async function deleteImage(feedsClient: FeedsClient, url: string) {
  try {
    await feedsClient.deleteImage({
      url: url,
    });
    console.log("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

//delete file
export async function deleteFile(feedsClient: FeedsClient, url: string) {
  try {
    await feedsClient.deleteFile({
      url: url,
    });
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

//delete activity
export async function deleteActivity(
  feedsClient: FeedsClient,
  activity_id: string
) {
  try {
    // First, get the activity to retrieve its attachments
    const activity = await getPostById(feedsClient, activity_id);

    // Delete all attachments (images/files) associated with this activity
    if (activity?.attachments && activity.attachments.length > 0) {
      for (const attachment of activity.attachments) {
        const url = attachment.image_url || attachment.asset_url;
        if (url) {
          try {
            if (attachment.type === "image") {
              await deleteImage(feedsClient, url);
            } else if (attachment.type === "file") {
              await deleteFile(feedsClient, url);
            }
          } catch (error) {
            console.error(`Error deleting ${attachment.type}:`, error);
            // Continue deleting other attachments even if one fails
          }
        }
      }
    }

    // Finally, delete the activity itself
    await feedsClient.deleteActivity({
      id: activity_id,
      hard_delete: false,
    });
    console.log("Activity and its attachments deleted successfully");
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
}

//get Post by id
export async function getPostById(
  feedsClient: FeedsClient,
  activity_id: string
) {
  const result = await feedsClient.queryActivities({
    filter: {
      id: { $eq: activity_id },
    },
    sort: [{ field: "created_at", direction: -1 }],
    limit: 1,
  });

  return result.activities[0];
}

// Transform Stream activity to INewPost format
export function transformActivityToPost(activity: any): INewPost {
  // Transform attachments to IUploadedFile format
  const files: IUploadedFile[] =
    activity.attachments?.map((attachment: any) => ({
      url: attachment.image_url || attachment.asset_url || "",
      type: attachment.type as "image" | "file",
    })) || [];

  // Transform interest_tags array to comma-separated string
  const interest_tags = Array.isArray(activity.interest_tags)
    ? activity.interest_tags.join(", ")
    : "";

  // Get custom_location from custom object
  const custom_location = activity.custom?.custom_location || "";

  return {
    text: activity.text || "",
    file: files,
    custom_location,
    interest_tags,
  };
}

//Update Activity Partial
export async function UpdateActivityPartial(
  feedsClient: FeedsClient,
  activity_id: string,
  text: string,
  uploadedFiles: IUploadedFile[],
  custom_location?: string,
  interest_tags?: string
) {
  try {
    // Convert comma-separated tags string to array
    const tagsArray = interest_tags
      ? interest_tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // Create attachments array from uploaded files with their types
    const attachments = uploadedFiles.map((file) => {
      return {
        custom: {},
        type: file.type,
        ...(file.type === "image"
          ? { image_url: file.url }
          : { asset_url: file.url }),
      };
    });

    // Update the activity using updateActivityPartial
    await feedsClient.updateActivityPartial({
      id: activity_id,
      set: {
        text: text,
        attachments: attachments,
        custom: {
          custom_location: custom_location,
        },
        interest_tags: tagsArray,
      },
    });

    console.log("Activity updated successfully");
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
}

//Closes the WebSocket connection for a Stream Feeds client.

export async function closeWSFeedsConnection(client: FeedsClient) {
  try {
    console.log("Disconnecting Stream Feeds WebSocket...");

    // This properly closes the WebSocket and prevents reconnections
    await client.disconnectUser();

    console.log("Stream Feeds WebSocket disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting WebSocket:", error);
  }
}

//Add Activity to a feed
export async function AddActivity(
  feedsClient: FeedsClient,
  feedgroup: string,
  feed_id: string,
  text: string,
  uploadedFiles: IUploadedFile[],
  custom_location?: string,
  interest_tags?: string
) {
  // Create a feed (or get its data if exists)
  const feed = feedsClient.feed(feedgroup, feed_id);

  //get or create the feed before adding the activity
  const createdFeed = await feed.getOrCreate();
  console.log("getOrCreateFeed>>>", createdFeed);
  try {
    // Subscribe to WebSocket events for state updates
    await feed.getOrCreate({ watch: true });

    // Convert comma-separated tags string to array
    const tagsArray = interest_tags
      ? interest_tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    // Create attachments array from uploaded files with their types
    const attachments = uploadedFiles.map((file) => {
      return {
        custom: {},
        type: file.type,
        ...(file.type === "image"
          ? { image_url: file.url }
          : { asset_url: file.url }),
      };
    });

    //add activity to the feed
    await feed.addActivity({
      text: text,
      attachments: attachments,
      custom: {
        custom_location: custom_location,
      },
      interest_tags: tagsArray,
      type: "post",
    });
  } catch (error) {
    console.error("Error adding activity:", error);
    throw error;
  }
}

//get activities from a feed
export async function getFeedActivities(
  feedsClient: FeedsClient,
  feedgroup: string,
  feed_id: string
) {
  const feed = feedsClient.feed(feedgroup, feed_id);
  const activities = await feed.getOrCreate();
  console.log("getOrCreateFeed>>>", activities);
  return activities;
}

//add like
export async function addLike(feedsClient: FeedsClient, activity_id: string) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const addResponse = await feedsClient.addActivityReaction({
      activity_id: activity_id,
      type: "like",
      // Optionally override existing reaction
      enforce_unique: true,
    });
    console.log("addResponse>>>", addResponse);
  } catch (error) {
    console.error("Error adding like:", error);
  }
}

//Remove a like from an activity
export async function removeLike(
  feedsClient: FeedsClient,
  activity_id: string,
  type: string
) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const removeResponse = await feedsClient.deleteActivityReaction({
      activity_id: activity_id,
      type: type,
    });
    console.log("removeResponse>>>", removeResponse);
  } catch (error) {
    console.error("Error removing like:", error);
  }
}

//Bookmark activity
export async function bookmarkActivity(
  feedsClient: FeedsClient,
  activity_id: string
) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const bookmarkActivityResponse = await feedsClient.addBookmark({
      activity_id: activity_id,
    });
    console.log("bookmarkActivityResponse>>>", bookmarkActivityResponse);
    return bookmarkActivityResponse;
  } catch (error) {
    console.error("Error bookmarking activity:", error);
  }
}

//Remove a bookmark from an activity

export async function removeBookmark(
  feedsClient: FeedsClient,
  activity_id: string
) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const removeBookmarkResponse = await feedsClient.deleteBookmark({
      activity_id: activity_id,
    });
    console.log("removeBookmarkResponse>>>", removeBookmarkResponse);
    return removeBookmarkResponse;
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
}

//Pin activity
export async function pinActivity(
  feedsClient: FeedsClient,
  activity_id: string,
  feed_group: string,
  feed_id: string
) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const pinActivityResponse = await feedsClient.pinActivity({
      feed_group_id: feed_group,
      feed_id: feed_id,
      activity_id: activity_id,
    });
    console.log("pinActivityResponse>>>", pinActivityResponse);
    return pinActivityResponse;
  } catch (error) {
    console.error("Error pinning activity:", error);
  }
}
