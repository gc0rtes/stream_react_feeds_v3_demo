import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";

import { useUserContext, INITIAL_USER } from "@/context/AuthContext";
import { Loader } from "lucide-react";

import { sidebarLinks } from "@/constants";
import type { INavLink } from "@/types";
import { closeWSFeedsConnection } from "@/lib/stream/api";

const LeftSidebar = () => {
  const {
    user,
    setIsAuthenticated,
    setUser,
    isLoading,
    feedsClient,
    setClient,
    setIsConnected,
  } = useUserContext();
  const { pathname } = useLocation();
  const { mutate: signOut } = useSignOutAccount();
  const navigate = useNavigate();

  //Handle sign out
  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (feedsClient) {
      await closeWSFeedsConnection(feedsClient);
    }
    setClient(null);
    setIsConnected(false);
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <nav className="hidden md:flex px-6 py-10 flex-col justify-between min-w-[270px] bg-dark-2">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>
        {isLoading || !user.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-14 w-14 rounded-full"
            />
            <div className="flex flex-col">
              <p className="body-bold">{user.name}</p>
              <p className="small-regular ">@{user.username}</p>
            </div>
          </Link>
        )}
        <ul className="flex flex-col gap-6 ">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${
                  isActive && "bg-primary-500"
                }`}
              >
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4"
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <Button
          variant="ghost"
          className="shad-button_ghost"
          onClick={handleSignOut}
        >
          <img
            src="/assets/icons/logout.svg"
            alt="logout"
            width={20}
            height={20}
          />
          <p className="small-medium lg:base-medium ">Logout</p>
        </Button>
      </div>
    </nav>
  );
};

export default LeftSidebar;
