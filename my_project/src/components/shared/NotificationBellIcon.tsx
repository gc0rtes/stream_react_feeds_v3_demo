import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationBellIconProps = {
  showBadge: boolean;
  className?: string;
  iconClassName?: string;
};

export function NotificationBellIcon({
  showBadge,
  className,
  iconClassName,
}: NotificationBellIconProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Bell
        className={cn(
          "size-[22px] stroke-[1.75] text-primary-500 group-hover:text-white md:size-6",
          iconClassName,
        )}
        aria-hidden
      />
      {showBadge ? (
        <span
          className="absolute -right-px -top-px size-1.5 rounded-full bg-red-500 ring-1 ring-dark-2"
          aria-label="New notifications"
        />
      ) : null}
    </span>
  );
}
