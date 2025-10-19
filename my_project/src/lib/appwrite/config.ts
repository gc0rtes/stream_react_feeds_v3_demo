import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,   
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
}

//createa an client instance
export const client = new Client();


client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.endpoint);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);