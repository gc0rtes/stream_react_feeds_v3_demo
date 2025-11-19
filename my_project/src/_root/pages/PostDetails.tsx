import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/PostStats";
import ImageCarousel from "@/components/shared/ImageCarousel";
import PostHeader from "@/components/shared/PostHeader";
import PostContent from "@/components/shared/PostContent";
import PostOwnerActions from "@/components/shared/PostOwnerActions";

const PostDetails = () => {
  const { user } = useUserContext();
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

  const handleDeletePost = () => {
    console.log("handleDeletePost>>>");
  };

  if (isLoadingPost || !activity) return <Loader />;

  return (
    <div className="flex flex-col flex-1 gap-10 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar items-center;">
      <div className="bg-dark-2 w-full max-w-5xl rounded-[30px] flex-col flex xl:flex-row border border-dark-4 xl:rounded-l-[24px]">
        <div className="relative h-80 lg:h-[480px] xl:w-[48%] rounded-t-[30px] xl:rounded-l-[24px] xl:rounded-tr-none p-5 bg-dark-1">
          <ImageCarousel
            images={images}
            imageClassName="h-full w-full rounded-[24px] object-cover"
            containerClassName="relative h-full w-full"
          />
        </div>
        <div className="bg-dark-2 flex flex-col gap-5 lg:gap-7 flex-1 items-start p-8 rounded-[30px]">
          <PostHeader
            post={activity}
            avatarSize="h-8 w-8 rounded-full lg:h-12 lg:w-12"
            showActions={isOwner}
            actions={
              isOwner ? (
                <PostOwnerActions
                  postId={activity.id}
                  onDelete={handleDeletePost}
                />
              ) : undefined
            }
          />
          <hr className="border w-full border-white/10" />
          <PostContent
            text={activity?.text || ""}
            interestTags={activity?.interest_tags || []}
            className="flex flex-col flex-1 w-full small-medium lg:base-regular"
          />

          <div className="w-full ">
            <PostStats post={activity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
