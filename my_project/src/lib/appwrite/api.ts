import type { INewUser } from "@/types";
import { account, avatars, tablesDB, appwriteConfig } from "./config";
import { ID, Query } from "appwrite";

//Create User Account and create a user row in the users database
export async function createUserAccount(user: INewUser) {
  try {
    //createa new auth account at Appwrite
    const newAccount = await account.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });
    if (!newAccount) throw new Error("Account not created");

    const avatarUrl = avatars.getInitials({
      name: user.name,
    });
    console.log("avatarUrl", avatarUrl);

    //write to database
    const newUser = await saveUserToDB({
      userId: `user_${newAccount.$id}`,
      username: user.username,
      email: user.email,
      name: user.name,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return { error };
  }
}

//save to DB function
export async function saveUserToDB(user: {
  userId: string;
  username: string;
  email: string;
  name: string;
  imageUrl: string;
}) {
  try {
    const newUser = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: "users",
      rowId: ID.unique(),
      data: user,
    });
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// Create a new session
export async function signInAccount(email: string, password: string) {
  try {
    // First, try to delete any existing session
    try {
      await account.deleteSession({
        sessionId: "current",
      });
      console.log("🗑️ Deleted existing session");
    } catch (error) {
      console.log(error);
      // Ignore error if no session exists
      console.log("ℹ️ No existing session to delete");
    }

    // Now create a new session
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    console.log("✅ Session created successfully:", session);

    // Check if session is saved to localStorage
    const cookieFallback = localStorage.getItem("cookieFallback");
    console.log("📦 cookieFallback after session creation:", cookieFallback);

    return session;
  } catch (error) {
    console.error("❌ Failed to create session:", error);
    throw error;
  }
}

//Get current user
export async function getCurrentUser() {
  try {
    //Get current account from authentication
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No account found");

    //Get current user from database
    const databaseId = appwriteConfig.databaseId;
    const tableId = "users";
    const query = [Query.equal("userId", `user_${currentAccount.$id}`)];

    // Fetch rows from the table
    const currentUser = await tablesDB.listRows({
      databaseId,
      tableId,
      queries: query,
    });

    if (!currentUser || currentUser.rows.length === 0) {
      throw new Error("User not found in database");
    }

    return currentUser.rows[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

//Delete a session - logout
export async function signOutAccount() {
  try {
    const response = await account.deleteSession({
      sessionId: "current", //Use the string 'current' to delete the current device session.
    });
    console.log("🗑️ Session deleted successfully:", response);
    return response;
  } catch (error) {
    console.log(error);
  }
}
