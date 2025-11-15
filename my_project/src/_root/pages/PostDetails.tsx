import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { useParams } from "react-router-dom";
import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";

const PostDetails = () => {
  const { id } = useParams();
  const { feedsClient } = useUserContext();
  const { data: activity, isLoading: isLoadingPost } = useGetPostById(
    feedsClient!,
    id || ""
  );
  console.log("post from PostDetails>>>", activity);

  if (isLoadingPost || !activity) return <Loader />;

  return <PostCard post={activity} />;
};

export default PostDetails;
