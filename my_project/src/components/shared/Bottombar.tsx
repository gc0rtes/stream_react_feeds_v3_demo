import { bottombarLinks } from "@/constants";
import { Link, useLocation } from "react-router-dom";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="z-50 flex justify-around items-center w-full sticky bottom-0 rounded-t-[20px] bg-dark-2 px-2 py-3 md:hidden">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;

        return (
          <Link
            to={link.route}
            key={link.label}
            className={`${
              isActive && "bg-primary-500 rounded-[10px]"
            } flex-center gap-1 p-2 flex-col transition flex-1`}
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
