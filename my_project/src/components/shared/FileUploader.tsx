import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { isImageFile } from "@stream-io/feeds-client";
import type { StreamFile } from "@stream-io/feeds-client";
import { useUserContext } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

type FileUploaderProps = {
  fieldChange: (files: string[]) => void;
  mediaUrls: string[];
};

const FileUploader = ({ fieldChange, mediaUrls }: FileUploaderProps) => {
  const { feedsClient } = useUserContext();
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>(mediaUrls);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      setIsUploading(true);

      if (!feedsClient) {
        console.error("Feeds client is not initialized");
        setIsUploading(false);
        return;
      }

      try {
        const requests = [];
        for (const file of acceptedFiles as StreamFile[]) {
          if (isImageFile(file)) {
            requests.push(
              feedsClient.uploadImage({
                file,
                // Optionally provide resize params
                upload_sizes: [
                  {
                    width: 100,
                    height: 100,
                    resize: "scale",
                    crop: "center",
                  },
                  {
                    width: 400,
                    height: 400,
                    resize: "scale",
                    crop: "center",
                  },
                ],
              })
            );
          } else {
            requests.push(
              feedsClient.uploadFile({
                file,
              })
            );
          }
        }

        const fileResponses = await Promise.all(requests);

        // Extract URLs from responses and filter out undefined values
        const uploadedUrls = fileResponses
          .map((response) => response.file)
          .filter((url): url is string => url !== undefined);
        setFileUrls(uploadedUrls);
        fieldChange(uploadedUrls);
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [feedsClient, fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg", ".gif"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer border-2 border-dashed border-light-4/20 p-7 lg:p-10"
      >
        <input {...getInputProps()} className="cursor-pointer" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin" />
            <p className="text-light-4 text-sm">Uploading to Stream CDN...</p>
          </div>
        ) : (
          <>
            <img
              src="/assets/icons/file-upload.svg"
              width={96}
              height={77}
              alt="file upload"
            />

            <h3 className="base-medium text-light-2 mb-2 mt-6">
              Drag photos/videos here
            </h3>
            <p className="text-light-4 small-regular mb-6">
              SVG, PNG, JPG, MP4
            </p>

            <Button type="button" className="shad-button_dark_4">
              Select from computer
            </Button>
          </>
        )}
      </div>

      {fileUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-light-2 text-sm font-semibold">
            Uploaded Files:
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {fileUrls.map((url, index) => (
              <div key={index} className="relative">
                {files[index]?.type.startsWith("image/") ? (
                  <img
                    src={url}
                    alt={`uploaded-${index}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-dark-4 rounded-lg flex items-center justify-center">
                    <p className="text-light-4 text-xs">{files[index]?.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
