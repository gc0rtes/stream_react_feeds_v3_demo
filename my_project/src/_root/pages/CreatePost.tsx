import React from "react";

const CreatePost = () => {
  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 w-full max-w-5xl">
          <img
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="add"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Create Post</h2>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
