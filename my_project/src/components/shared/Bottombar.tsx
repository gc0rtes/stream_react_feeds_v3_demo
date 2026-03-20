import { bottombarLinks } from "@/constants";
import { Link, useLocation } from "react-router-dom";
import { useNotificationBadge } from "@/context/NotificationBadgeContext";
import { NotificationBellIcon } from "@/components/shared/NotificationBellIcon";

const Bottombar = () => {
  const { pathname } = useLocation();
  const { hasUnread } = useNotificationBadge();

  return (
    <nav className="z-50 flex justify-around items-center w-full sticky bottom-0 rounded-t-[20px] bg-dark-2 px-2 py-3 md:hidden">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const isNotifications = link.route === "/notifications";

        return (
          <Link
            to={link.route}
            key={link.label}
            className={`${
              isActive && "bg-primary-500 rounded-[10px]"
            } flex-center gap-1 p-2 flex-col transition flex-1 min-w-0`}
          >
            {isNotifications ? (
              <NotificationBellIcon
                showBadge={hasUnread}
                iconClassName={`size-4 md:size-[18px] ${isActive ? "text-white" : ""}`}
              />
            ) : (
              <img
                src={link.imgURL}
                alt={link.label}
                height={16}
                width={16}
                className={` ${isActive && "invert-white"}`}
              />
            )}
            <p className="tiny-medium text-light-2 truncate max-w-full px-0.5">
              {link.label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
};
export default Bottombar;
