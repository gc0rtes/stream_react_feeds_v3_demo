import { FeedsClient } from "@stream-io/feeds-client";

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
  fileUrls: string[],
  custom_location?: string,
  interest_tags?: string
) {
  // Create a feed (or get its data if exists)
  const feed = feedsClient.feed(feedgroup, feed_id);

  //get or create the feed before adding the activity
  const createdFeed = await feed.getOrCreate();
  console.log("createdFeed>>>", createdFeed);

  // Subscribe to WebSocket events for state updates
  await feed.getOrCreate({ watch: true });

  // Convert comma-separated tags string to array
  const tagsArray = interest_tags
    ? interest_tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    : [];

  // Create attachments array from uploaded file URLs
  const attachments = fileUrls.map((url) => {
    const isImage = url.match(/\.(jpg|jpeg|png|gif|svg)$/i);
    return {
      custom: {},
      ...(isImage ? { image_url: url } : { asset_url: url }),
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
}

//get activities from a feed
// const activities = await feed.getActivities();
// console.log(activities);
