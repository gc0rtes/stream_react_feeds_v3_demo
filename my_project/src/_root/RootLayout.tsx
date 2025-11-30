import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { Outlet } from "react-router-dom";
import { StreamFeeds } from "@stream-io/feeds-react-sdk";
import { useUserContext } from "@/context/AuthContext";

const RootLayout = () => {
  const { feedsClient } = useUserContext();

  const content = (
    <div className="w-full md:flex ">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <Bottombar />
    </div>
  );

  if (!feedsClient) {
    return content;
  }

  return <StreamFeeds client={feedsClient}>{content}</StreamFeeds>;
};

export default RootLayout;
