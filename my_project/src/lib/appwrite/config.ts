import { Client, Account, Storage, Avatars, TablesDB } from "appwrite";

export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
};

//create a client instance
export const client = new Client();

client
  .setProject(appwriteConfig.projectId)
  .setEndpoint(appwriteConfig.endpoint);

// Log client configuration for debugging
console.log("🔧 Appwrite Client configured:", {
  projectId: appwriteConfig.projectId,
  endpoint: appwriteConfig.endpoint,
});

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
