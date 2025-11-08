import { Link } from "react-router-dom";

type PostCardTypes = {
  post: any;
};

const PostCard = ({ post }: PostCardTypes) => {
  const formatDate = (date: Date | string) => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-dark-2 rounded-3xl border border-dark-4 p-5 lg:p-7 w-full max-w-screen-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.user.id}`}>
            <img
              src={
                post.user.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="h-10 w-10 rounded-full lg:h-12"
            />
          </Link>
          <div className="flex flex-col">
            <p className="text-light-1">{post.user.name || post.user.id}</p>
            <p className="text-light-3 text-sm">
              {formatDate(post.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
