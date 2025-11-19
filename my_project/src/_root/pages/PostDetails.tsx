import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { Link, useParams } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PostStats from "@/components/PostStats";

const PostDetails = () => {
  const { user } = useUserContext();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { id } = useParams();
  const { feedsClient } = useUserContext();
  const { data: activity, isLoading: isLoadingPost } = useGetPostById(
    feedsClient!,
    id || ""
  );
  console.log("useGetPostById PostDetails>>>", activity);

  const isOwner = user?.id === activity?.user.id;

  const images =
    activity?.attachments?.filter(
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

  const handleDeletePost = () => {
    console.log("handleDeletePost>>>");
  };

  if (isLoadingPost || !activity) return <Loader />;

  return (
    <div className="flex flex-col flex-1 gap-10 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar items-center;">
      <div className="bg-dark-2 w-full max-w-5xl rounded-[30px] flex-col flex xl:flex-row border border-dark-4 xl:rounded-l-[24px]">
        <img
          src={images[currentImageIndex].image_url}
          alt="post"
          className="h-80 lg:h-[480px] xl:w-[48%] rounded-t-[30px] xl:rounded-l-[24px] xl:rounded-tr-none object-cover p-5 bg-dark-1"
        />
        {/* Navigation Arrows - Only show if multiple images */}
        {hasMultipleImages && (
          <>
            {/* Left Arrow */}
            <button
              onClick={handlePreviousImage}
              className=" absolute left-2 top-1/4 -translate-y-1/4 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
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
              className="absolute right-2 top-1/4 -translate-y-1/4 bg-dark-4/80 hover:bg-dark-4 rounded-full p-2 transition-colors"
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
        <div className="bg-dark-2 flex flex-col gap-5 lg:gap-7 flex-1 items-start p-8 rounded-[30px]">
          <div className="flex justify-between items-center w-full">
            <Link
              to={`/profile/${activity?.user.id}`}
              className="flex items-center gap-3"
            >
              <img
                src={
                  activity?.user.image ||
                  "/assets/icons/profile-placeholder.svg"
                }
                alt="creator"
                className="h-8 w-8 rounded-full lg:h-12 lg:w-12"
              />

              <div className="flex flex-col">
                <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
                  @{activity?.user.name || activity?.user.id}
                </p>

                <div className="flex-center gap-2 text-light-3 text-sm">
                  <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
                    {formatDate(activity?.created_at)}
                  </p>
                  -
                  <p className="text-[12px] font-semibold leading-[140%] lg:text-[14px] lg:font-normal">
                    {activity?.custom.custom_location}
                  </p>
                </div>
              </div>
            </Link>
            {isOwner && (
              <div className="flex items-center gap-4">
                <Link to={`/update-post/${activity?.id}`}>
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    className="h-5 w-5"
                  />
                </Link>

                <Button
                  // src="/assets/icons/delete.svg"
                  // alt="delete"
                  onClick={handleDeletePost}
                  variant="ghost"
                  className="p-0 flex gap-3 hover:bg-transparent hover:text-light-1  text-light-1 small-medium lg:base-medium"
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    className="h-5 w-5"
                  />
                </Button>
              </div>
            )}
          </div>
          <hr className="border w-full border-white/10" />
          <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
            <p>{activity?.text}</p>
            <ul className="flex gap-1 mt-2">
              {activity?.interest_tags.map((tag: string) => (
                <li key={tag} className="text-light-3">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full ">
            <PostStats post={activity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
