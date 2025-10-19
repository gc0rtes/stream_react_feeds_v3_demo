import type { INewUser } from "@/types";
import { account } from "./config";
import { ID } from "appwrite";
export const createUserAccount = async (user: INewUser) => {
try {
    //createa new account at Appwrite
    const newAccount = await account.create({
        userId: ID.unique(),
        email: user.email,
        password: user.password,
        name: user.name}
    );
    return newAccount;
} catch (error) {
   console.log(error)
   return { error };
}
}