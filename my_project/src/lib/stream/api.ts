import { FeedsClient } from "@stream-io/feeds-client";

/**
 * Closes the WebSocket connection for a Stream Feeds client.
 *
 * Note: You may still see 1-2 health check events after calling this function.
 * This is normal - they are in-flight messages that were sent before disconnection.
 * The connection will NOT reconnect after calling this function.
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
