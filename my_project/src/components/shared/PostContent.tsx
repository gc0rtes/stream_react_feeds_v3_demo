type PostContentProps = {
  text: string;
  interestTags: string[];
  className?: string;
};

const PostContent = ({
  text,
  interestTags,
  className = "text-[14px] font-medium leading-[140%] lg:text-[16px] py-5",
}: PostContentProps) => {
  return (
    <div className={className}>
      <p>{text}</p>
      <ul className="flex gap-1 mt-2">
        {interestTags.map((tag: string) => (
          <li key={tag} className="text-light-3">
            #{tag}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostContent;
