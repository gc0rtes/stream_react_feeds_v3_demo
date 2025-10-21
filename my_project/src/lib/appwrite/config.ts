import { Client, Account, Storage, Avatars, TablesDB } from "appwrite";

export const appwriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
};

//createa an client instance
export const client = new Client();

client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.endpoint);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
// export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
