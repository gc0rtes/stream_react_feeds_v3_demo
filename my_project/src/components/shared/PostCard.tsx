import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "../PostStats";

type PostCardTypes = {
  post: any;
};

const PostCard = ({ post }: PostCardTypes) => {
  const { user } = useUserContext();
  const isOwner = user?.id === post.user.id;
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
            <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
              @{post.user.name || post.user.id}
            </p>

            <div className="flex-center gap-2 text-light-3 text-sm">
              <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
                {formatDate(post.created_at)}
              </p>
              -
              <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
                {post.custom.custom_location}
              </p>
            </div>
          </div>
        </div>
        {isOwner && (
          <>
            <Link to={`/update-post/${post.id}`}>
              <img
                src="/assets/icons/edit.svg"
                alt="edit"
                className="h-5 w-5"
              />
            </Link>
            <Link to={`/delete-post/${post.id}`}>
              <img
                src="/assets/icons/delete.svg"
                alt="delete"
                className="h-5 w-5"
              />
            </Link>
          </>
        )}
      </div>
      <Link to={`/post/${post.id}`}>
        <div className="text-[14px] font-medium leading-[140%] lg:text-[16px] py-5">
          <p>{post.text}</p>
          <ul className="flex gap-1 mt-2">
            {post.interest_tags.map((tag: string) => (
              <li key={tag} className="text-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>
        {post.attachments &&
          post.attachments.length > 0 &&
          (post.attachments[0].type === "image" ? (
            <img
              src={post.attachments[0].image_url}
              alt="post image"
              className="h-64 xs:h-[400px] lg:h-[450px] w-full rounded-[24px] object-cover mb-5;"
            />
          ) : (
            // Placeholder for video - will be replaced with inline video player later
            <div className="w-full h-64 bg-dark-3 rounded-[24px] flex items-center justify-center">
              <img
                src="/assets/icons/file-upload.svg"
                alt="video file"
                className="w-16 h-16 opacity-50"
              />
            </div>
          ))}
      </Link>

      <PostStats post={post} user_id={user?.id} />
    </div>
  );
};

export default PostCard;
