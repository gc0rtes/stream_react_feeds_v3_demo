import { Link } from "react-router-dom";
import PostStats from "../PostStats";

type GridPostListProps = {
  posts: any;
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  console.log("grid post list posts>>>", posts);
  return (
    <ul className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7 max-w-5xl">
      {posts.map((post: any) => {
        return (
          <li key={post.id} className="relative min-w-80 h-80">
            <Link
              to={`/post/${post.id}`}
              className="flex rounded-[24px] border border-dark-4 overflow-hidden cursor-pointer w-full h-full"
            >
              <img
                src={post.attachments[0]?.image_url} //todo: render carousel images
                alt={post.text}
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="absolute bottom-0 p-5 flex-between w-full bg-gradient-to-t from-dark-3 to-transparent rounded-b-[24px] gap-2">
              {showUser && (
                <div className="flex items-center justify-start gap-2 flex-1">
                  <img
                    src={post.user.image}
                    alt="creator"
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="line-clamp-1">{post.user.name}</p>
                </div>
              )}
              {showStats && <PostStats post={post} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
