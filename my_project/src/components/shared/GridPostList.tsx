import React from "react";
import { Link } from "react-router-dom";

type GridPostListProps = {
  post: any;
};

const GridPostList = ({ post }: GridPostListProps) => {
  const images =
    post.attachments?.filter(
      (attachment: any) => attachment.type === "image"
    ) || [];

  const firstImage = images[0];

  if (!firstImage) return null;

  return (
    <Link to={`/post/${post.id}`} className="relative group">
      <img
        src={firstImage.image_url}
        alt={post.text || "Post image"}
        className="h-64 w-full object-cover rounded-lg"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
    </Link>
  );
};

export default GridPostList;
