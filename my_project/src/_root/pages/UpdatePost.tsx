import PostForm from "@/components/forms/PostForm";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";

const UpdatePost = () => {
  const { id } = useParams();
  const { feedsClient } = useUserContext();
  const { data: post, isLoading: isLoadingPost } = useGetPostById(
    feedsClient!,
    id || ""
  );
  console.log("post>>>", post);

  if (isLoadingPost) return <Loader />;

  return (
    <div className="flex flex-1">
      <div className=" flex flex-col flex-1 items-center gap-10 overflow-scroll py-10 px-5 md:px-8 lg:p-14 custom-scrollbar">
        <div className=" max-w-3xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="update"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Update Post</h2>
        </div>
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default UpdatePost;
