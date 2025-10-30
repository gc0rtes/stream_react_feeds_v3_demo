import { FeedsClient } from "@stream-io/feeds-client";

export async function closeWSFeedsConnection(client: FeedsClient) {
  console.log("Closing WS feeds connection");
  return await client.disconnectUser();
}
