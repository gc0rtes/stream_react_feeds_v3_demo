import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

import { Controller, useForm } from "react-hook-form";
import { PostValidation } from "@/lib/validation";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";

type PostFormProps = {
  post?: Models.Document; //model from appwrite I need from stream
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  const onSubmit = (data: z.infer<typeof PostValidation>) => {
    console.log(data);
  };

  return (
    <form
      id="form-create-post"
      className="border-2 border-blue-500 flex flex-col gap-9 w-full max-w-3xl"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet>
        <FieldGroup>
          <Controller
            name="caption"
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
                <FileUploader />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <FieldSeparator />
          <Controller
            name="location"
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
            name="tags"
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
