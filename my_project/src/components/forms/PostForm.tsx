import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

import { Controller, useForm } from "react-hook-form";
import { PostValidation } from "@/lib/validation";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import { AddActivity } from "@/lib/stream/api";

import { useUserContext } from "@/context/AuthContext";

import type { INewPost } from "@/types";

type PostFormProps = {
  post?: INewPost;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const { feedsClient } = useUserContext();
  const { user } = useUserContext();
  const user_id = user?.id;

  const navigate = useNavigate();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      text: post ? post?.text : "",
      file: [],
      custom_location: post ? post.custom_location : "",
      interest_tags: Array.isArray(post?.interest_tags)
        ? post.interest_tags.join(",")
        : post?.interest_tags || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof PostValidation>) => {
    console.log(data);

    // Check if feedsClient and user_id are available
    if (!feedsClient) {
      toast.error("Feeds client is not initialized. Please try again.");
      return;
    }

    try {
      // ACTION = CREATE

      if (action === "Create") {
        //create a new stream post. The feed group and the feed id can change dynamically according to the app architecture
        await AddActivity(
          feedsClient,
          "user", //feed group
          user_id, //feed id
          data.text,
          data.file,
          data.custom_location,
          data.interest_tags
        );

        toast.success(`${action} post successful!`);
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(`${action} post failed. Please try again.`);
    }
  };

  return (
    <form
      id="form-create-post"
      className=" flex flex-col gap-9 w-full max-w-3xl"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <FieldGroup>
          <Controller
            name="text"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel
                  className="shad-form_label"
                  htmlFor="create-post-message"
                >
                  Caption
                </FieldLabel>
                <Textarea
                  className=" h-36 bg-dark-4/90 rounded-xl border border-light-4/20 focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3 custom-scrollbar "
                  id="create-post-caption"
                  placeholder="Add any additional comments"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <FieldSeparator />
          <Controller
            name="file"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel
                  className="shad-form_label"
                  htmlFor="create-post-file"
                >
                  Add photos or videos
                </FieldLabel>

                {/* Custom File Uploader Component*/}
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrls={field.value || []}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <FieldSeparator />
          <Controller
            name="custom_location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel
                  className="shad-form_label"
                  htmlFor="create-post-location"
                >
                  Add Location
                </FieldLabel>

                <Input
                  type="text"
                  className="h-12 bg-dark-4/90 border-none placeholder:text-light-4 focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3;"
                  id="create-post-location"
                  placeholder="Add location"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <FieldSeparator />
          <Controller
            name="interest_tags"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel
                  className="shad-form_label"
                  htmlFor="create-post-tags"
                >
                  Add Tags separated by commas ","
                </FieldLabel>

                <Input
                  type="text"
                  className="h-12 bg-dark-4/90 border-none placeholder:text-light-4 focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3;"
                  id="create-post-tags"
                  placeholder="Art, Fashion, etc."
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          className="h-10 px-5 bg-primary-500 hover:bg-primary-500 text-light-1 flex gap-2 !important"
          form="form-create-post"
        >
          Submit
        </Button>
        <Button
          type="button"
          className="h-10 bg-dark-4 px-5 text-light-1 flex gap-2 !important"
          form="form-create-post"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
