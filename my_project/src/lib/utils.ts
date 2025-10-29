import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getUserToken(user_id: string) {
  const response = await fetch(
    "https://69025a03001f08697be3.nyc.appwrite.run/token_provider",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id }),
    }
  );
  const data = await response.json();
  return data.userToken;
}
