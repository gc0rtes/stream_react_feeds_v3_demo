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

  const connectUser = async (apiKey: string, userId: string | undefined) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const feedsClient = new FeedsClient(apiKey);
      const tokenProvider = await getUserToken(userId);
      if (!tokenProvider) {
        throw new Error("Token not found");
      }
      console.log("tokenProvider>>>", tokenProvider);

      const connection = await feedsClient.connectUser(
        { id: userId },
        tokenProvider
      );
      console.log("connection>>>", connection);
      setClient(feedsClient);
      console.log("feedsClient>>>", feedsClient);
      setIsConnected(true);
      console.log("User connected successfully");

      // Set up event listeners for all WebSocket events
      feedsClient.on("all", (event) => {
        console.log("WS event:", event);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const checkAuthUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("✅ currentUser from DB:", currentUser);
      if (currentUser) {
        //Set user data to state
        const userData = {
          id: currentUser.$id || currentUser.userId,
          name: currentUser.name,
          username: currentUser.username,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
          bio: currentUser.bio,
        };

        console.log("📝 Setting user state with:", userData);
        setUser(userData);

        setIsAuthenticated(true);
        connectUser(import.meta.env.VITE_STREAM_FEEDS_API_KEY, userData.id);
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

  //if user is not authenticated, redirect to sign-in page
  useEffect(() => {
    const cookieFallback = localStorage.getItem("cookieFallback");

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
