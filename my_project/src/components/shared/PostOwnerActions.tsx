import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type PostOwnerActionsProps = {
  postId: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
};

const PostOwnerActions = ({
  postId,
  onDelete,
  showDeleteButton = true,
}: PostOwnerActionsProps) => {
  return (
    <>
      <Link to={`/update-post/${postId}`}>
        <img src="/assets/icons/edit.svg" alt="edit" className="h-5 w-5" />
      </Link>
      {showDeleteButton &&
        (onDelete ? (
          <Button
            onClick={onDelete}
            variant="ghost"
            className="p-0 flex gap-3 hover:bg-transparent hover:text-light-1 text-light-1 small-medium lg:base-medium"
          >
            <img
              src="/assets/icons/delete.svg"
              alt="delete"
              className="h-5 w-5"
            />
          </Button>
        ) : (
          <Link to={`/delete-post/${postId}`}>
            <img
              src="/assets/icons/delete.svg"
              alt="delete"
              className="h-5 w-5"
            />
          </Link>
        ))}
    </>
  );
};

export default PostOwnerActions;
