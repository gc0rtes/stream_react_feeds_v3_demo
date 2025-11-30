import { useMutation } from "@tanstack/react-query";
import type { INewUser } from "@/types";

import {
  createUserAccount,
  signInAccount,
  signOutAccount,
} from "../appwrite/api";

/* USER MANAGEMENT - Appwrite Operations Only */

export const useCreateUserAccount = () => {
  //Create user account in the database
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  //Sign in account in the database
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user.email, user.password),
  });
};

export const useSignOutAccount = () => {
  //Sign out account in the database
  return useMutation({
    mutationFn: () => signOutAccount(),
  });
};
