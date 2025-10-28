import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const LeftSidebar = () => {
  const { user } = useUserContext();
  const userId = user?.id;
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out");
    signOut();
  };

  useEffect(() => {
    if (isSuccess) {
      navigate(0); //reload the page
    }
  }, [isSuccess, navigate]);
  return (
    <nav className="leftsidebar">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={170}
            height={36}
          />
        </Link>
        <Link to={`/profile/${userId}`} className="flex gap-3 items-center">
          <img
            src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="h-14 w-14 rounded-full"
          />
          <div className="flex flex-col">
            <p className="body-bold text-light-1">{user.name}</p>
            <p className="small-regular text-light-3">@{user.username}</p>
          </div>
        </Link>
      </div>
      <Button
        variant="ghost"
        className="shad-button_ghost"
        onClick={handleLogout}
      >
        <img
          src="/assets/icons/logout.svg"
          alt="logout"
          width={20}
          height={20}
        />
      </Button>
    </nav>
  );
};

export default LeftSidebar;
