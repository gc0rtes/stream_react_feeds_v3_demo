import React from "react";

const PostStats = ({ post, user_id }: { post: any; user_id: string }) => {
  const handleLike = () => {
    console.log("like");
  };
  return (
    <div>
      <div className="flex justify-between items-center z-20">
        <div className="flex gap-2 mr-5">
          <img
            src="/assets/icons/like.svg"
            alt="like"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() => handleLike()}
          />
          <p className="text-[16px] font-medium leading-[140%] lg:text-[18px] lg:font-bold text-light-1">
            0
          </p>
        </div>
        <div className="flex gap-2 mr-5">
          <img
            src="/assets/icons/save.svg"
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default PostStats;
