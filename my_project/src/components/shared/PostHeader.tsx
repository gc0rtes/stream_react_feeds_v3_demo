import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useClientConnectedUser } from "@stream-io/feeds-react-sdk";

type PostHeaderProps = {
  post: any;
  avatarSize?: string;
  showActions?: boolean;
  actions?: React.ReactNode;
  isFollowing?: boolean;
};

const PostHeader = ({
  post,
  avatarSize = "h-10 w-10 rounded-full lg:h-12 lg:w-12",
  showActions = false,
  actions,
  isFollowing = false,
}: PostHeaderProps) => {
  const { user } = useClientConnectedUser();
  console.log("stream user>>>", user);

  return (
    <div className="flex justify-between items-center w-full">
      <Link
        to={`/profile/${post?.user.id}`}
        className="flex items-center gap-3"
      >
        <img
          src={
            post?.user.image ||
            post?.user.imageUrl ||
            "/assets/icons/profile-placeholder.svg"
          }
          alt="creator"
          className={avatarSize}
        />

        <div className="flex flex-col">
          <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
            @{post?.user.name || post?.user.id}
          </p>

          <div className="flex-center gap-2 text-light-3 text-sm">
            <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
              {formatDate(post?.created_at)}
            </p>
            -
            <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
              {post?.custom.custom_location}
            </p>
          </div>
        </div>
      </Link>
      {showActions && actions && (
        <div className="flex items-center gap-4">{actions}</div>
      )}
    </div>
  );
};

export default PostHeader;
