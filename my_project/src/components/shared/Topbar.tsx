import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useEffect } from "react";
import { useUserContext } from "@/context/AuthContext";

const Topbar = () => {
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
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <img
            src="/assets/images/logo.svg"
            alt="logo"
            width={130}
            height={325}
          />
        </Link>

        <div className="flex gap-4">
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
          <Link to={`/profile/${userId}`} className="flex-center gap-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
