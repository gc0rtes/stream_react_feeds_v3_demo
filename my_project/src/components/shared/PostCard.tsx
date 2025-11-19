import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import PostStats from "../PostStats";
import ImageCarousel from "./ImageCarousel";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostOwnerActions from "./PostOwnerActions";

type PostCardTypes = {
  post: any;
};

const PostCard = ({ post }: PostCardTypes) => {
  const { user } = useUserContext();
  const isOwner = user?.id === post.user.id;

  const images =
    post.attachments?.filter(
      (attachment: any) => attachment.type === "image"
    ) || [];

  return (
    <div className="bg-dark-2 rounded-3xl border border-dark-4 p-5 lg:p-7 w-full max-w-screen-sm">
      <PostHeader
        post={post}
        avatarSize="h-10 w-10 rounded-full lg:h-12 lg:w-12"
        showActions={isOwner}
        actions={isOwner ? <PostOwnerActions postId={post.id} /> : undefined}
      />
      <Link to={`/post/${post.id}`}>
        <PostContent text={post.text} interestTags={post.interest_tags} />
        <ImageCarousel images={images} />
      </Link>
      {/* reaction and comment section */}
      <PostStats post={post} />
    </div>
  );
};

export default PostCard;
