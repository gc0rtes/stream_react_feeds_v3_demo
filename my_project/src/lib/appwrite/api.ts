import type { INewUser } from "@/types";
import { account, avatars, tablesDB, appwriteConfig } from "./config";
import { ID } from "appwrite";

//Create User Account
export async function createUserAccount(user: INewUser) {
  try {
    //createa new account at Appwrite
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

    //create the user in the database
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

// Create a new section
export async function appWritelogin(email: string, password: string) {
  return await account.createEmailPasswordSession({
    email,
    password,
  });
}

//Delete a session - logout
export async function appWritelogout() {
  return await account.deleteSession({
    sessionId: "current", //Use the string 'current' to delete the current device session.
  });
}
