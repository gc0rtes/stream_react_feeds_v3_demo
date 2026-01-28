import { createContext, useState, useContext, useEffect } from "react";
import type { IContextType, IUser } from "@/types";
import { getCurrentUser } from "@/lib/appwrite/api";
import { getUserToken } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { FeedsClient } from "@stream-io/feeds-client";

export const INITIAL_USER = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
  feedsClient: null,
  setClient: () => {},
  isConnected: false,
  setIsConnected: () => {},
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedsClient, setClient] = useState<FeedsClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  //check if user is authenticated in appwrite
  const checkAuthUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("✅ User exists in Appwrite database:", currentUser);
      if (currentUser) {
        //Set user data to state
        const userData = {
          id: currentUser.$id || currentUser.userId, //should use userId as specified in the createUserAccount appwrite function
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
          bio: currentUser.bio,
        };

        console.log("📝 Setting user state with:", userData);
        setUser(userData);

        setIsAuthenticated(true);
        connectUser(import.meta.env.VITE_STREAM_FEEDS_API_KEY, userData);
        return true;
      }
      return false;
    } catch (error) {
      console.log("❌ Auth check error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Log state changes to see when they actually update
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🎉 User authenticated! State updated:", {
        user,
        isAuthenticated,
      });
    }
  }, [user, isAuthenticated]);

  //Check if user exists in Appwrite database, if user is not authenticated, redirect to sign-in page
  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");

    // console.log("check user auth", checkAuthUser());

    console.log("🔍 Checking auth on mount. cookieFallback:", cookieFallback);

    // Check if there's a valid session
    if (
      cookieFallback === "[]" ||
      cookieFallback === null ||
      cookieFallback === undefined
    ) {
      console.log("🔒 No active session found, redirecting to sign-in");
      navigate("/sign-in");
      return; // Don't call checkAuthUser if no session
    }

    // If we have a session, verify it with the server
    console.log("🔑 Session found, verifying with server...");
    checkAuthUser();
  }, []);

  //connect user to Stream Feeds
  const connectUser = async (apiKey: string, userData: IUser) => {
    try {
      if (!userData.id) {
        throw new Error("User ID is required");
      }
      const feedsClient = new FeedsClient(apiKey);
      const tokenProvider = await getUserToken(userData.id);
      if (!tokenProvider) {
        throw new Error("Token not found");
      }

      // Set up event listeners for all WebSocket events
      feedsClient.on("all", (event) => {
        console.log("WS event:", event);
      });
      console.log(
        "userdata>>",
        userData.id,
        userData.name,
        userData.username,
        userData.imageUrl
      );

      await feedsClient.connectUser(
        { id: userData.id, name: userData.name, image: userData.imageUrl },
        tokenProvider
      );

      setClient(feedsClient);

      setIsConnected(true);
      console.log("✅ User connected at Stream successfully");
    } catch (error) {
      console.error("❌ Error connecting user at Stream:", error);
    }
  };

  //Set the values provider to its children components
  const value = {
    user,
    feedsClient,
    isConnected,
    isAuthenticated,
    isLoading,
    setUser,
    setClient,
    setIsConnected,
    setIsAuthenticated,
    checkAuthUser,
  };

  //Return the values provider to its children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This is the custom hook to be imported in components
export const useUserContext = () => useContext(AuthContext);
