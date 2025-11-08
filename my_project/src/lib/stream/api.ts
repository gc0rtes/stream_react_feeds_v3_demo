import { FeedsClient } from "@stream-io/feeds-client";
import type { IUploadedFile } from "@/types";

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
    // Add activity
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
  activity_id: string
) {
  try {
    if (!feedsClient) {
      console.error("Feeds client is not initialized");
      return;
    }
    const removeResponse = await feedsClient.deleteActivityReaction({
      activity_id: activity_id,
      type: "like",
    });
    console.log("removeResponse>>>", removeResponse);
  } catch (error) {
    console.error("Error removing like:", error);
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
