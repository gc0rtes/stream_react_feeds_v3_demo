import type { FeedsClient } from "@stream-io/feeds-client";

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  feedsClient: FeedsClient | null;
  setClient: React.Dispatch<React.SetStateAction<FeedsClient | null>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type IUploadedFile = {
  url: string;
  type: "image" | "file";
};

export type INewPost = {
  userId: string;
  text: string;
  file: File[];
  custom_location?: string;
  interest_tags?: string;
};
