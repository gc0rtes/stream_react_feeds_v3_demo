import { bottombarLinks } from "@/constants";
import { Link, useLocation } from "react-router-dom";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <Link
            to={link.route}
            key={link.label}
            className={`${
              isActive && "bg-primary-500 rounded-[10px]"
            } flex-center gap-1 p-4 flex-col transition`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              height={16}
              width={16}
              className={` ${isActive && "invert-white"}`}
            />
            <p className="tiny-medium text-light-2">{link.label}</p>
          </Link>
        );
      })}
    </nav>
  );
};
export default Bottombar;
