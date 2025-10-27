import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out");
    signOut();
    navigate("/sign-in");
  };
  if (isSuccess) {
    navigate("/sign-in");
  }
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
        </div>
      </div>
    </section>
  );
};

export default Topbar;
