import { FeedsClient } from "@stream-io/feeds-client";
import type { IUploadedFile } from "@/types";

/**
 * Closes the WebSocket connection for a Stream Feeds client.
 */
export async function closeWSFeedsConnection(client: FeedsClient | null) {
  if (!client) {
    console.log("No client to disconnect");
    return;
  }

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
// const activities = await feed.getActivities();
// console.log(activities);
