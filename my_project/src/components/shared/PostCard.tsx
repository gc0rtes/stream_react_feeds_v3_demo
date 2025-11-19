import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "../PostStats";
import { useState } from "react";

type PostCardTypes = {
  post: any;
};

const PostCard = ({ post }: PostCardTypes) => {
  const { user } = useUserContext();
  const isOwner = user?.id === post.user.id;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    post.attachments?.filter(
      (attachment: any) => attachment.type === "image"
    ) || [];

  const hasMultipleImages = images.length > 1;

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleJumpToImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
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
        {images.length > 0 && (
          <div className="relative w-full mb-5">
            {/* Image Display */}
            <img
              src={images[currentImageIndex].image_url}
              alt="post image"
              className="h-64 xs:h-[400px] lg:h-[450px] w-full rounded-[24px] object-cover"
            />

            {/* Navigation Arrows - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                {/* Left Arrow */}
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-light-1"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                {/* Right Arrow */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-light-1"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => handleJumpToImage(e, index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                        index === currentImageIndex
                          ? "bg-primary-500 text-light-1"
                          : "bg-dark-4/80 text-light-3 hover:bg-dark-4"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Link>
      {/* reaction and comment section */}
      <PostStats post={post} />
    </div>
  );
};

export default PostCard;
