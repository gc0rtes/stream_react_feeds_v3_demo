import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { isImageFile } from "@stream-io/feeds-client";
import type { StreamFile } from "@stream-io/feeds-client";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "lucide-react";
import type { IUploadedFile } from "@/types";

type FileUploaderProps = {
  fieldChange: (files: IUploadedFile[]) => void;
  mediaUrls: IUploadedFile[];
};

const FileUploader = ({ fieldChange, mediaUrls }: FileUploaderProps) => {
  const { feedsClient } = useUserContext();
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>(
    mediaUrls.map((file) => file.url)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("fileUrls>>>", fileUrls);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      setFileUrls(acceptedFiles.map((file) => file.url));
      setIsUploading(true);
      setError(null); // Clear any previous errors

      if (!feedsClient) {
        console.error("Feeds client is not initialized");
        setIsUploading(false);
        return;
      }

      try {
        const uploadPromises = [];
        const fileTypes: ("image" | "file")[] = [];

        for (const file of acceptedFiles as StreamFile[]) {
          const isImage = isImageFile(file);
          fileTypes.push(isImage ? "image" : "file");

          if (isImage) {
            uploadPromises.push(
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
            uploadPromises.push(
              feedsClient.uploadFile({
                file,
              })
            );
          }
        }

        const fileResponses = await Promise.all(uploadPromises);

        // Create uploaded file objects with URL and type
        const uploadedFileData: IUploadedFile[] = fileResponses
          .map((response, index) => {
            if (response.file) {
              return {
                url: response.file,
                type: fileTypes[index],
              };
            }
            return null;
          })
          .filter((item): item is IUploadedFile => item !== null);

        setUploadedFiles(uploadedFileData);
        console.log("UploadedFiles>>>", uploadedFileData);
        fieldChange(uploadedFileData);
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [feedsClient, fieldChange]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors.some((e) => e.code === "file-too-large")) {
        setError("File size must be less than 10 MB");
      } else if (rejection.errors.some((e) => e.code === "file-invalid-type")) {
        setError("Invalid file type. Please upload an image or video file.");
      } else {
        setError("File upload failed. Please try again.");
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: 10 * 1024 * 1024, // 10 MB in bytes
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg", ".gif"],
      "video/*": [".mp4", ".webm", ".ogg"],
    },
  });

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
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
            <div className="flex flex-1 justify-center w-full p-5 lg:p-10 ">
              <img
                src={
                  uploadedFiles.length > 0
                    ? uploadedFiles[0].url
                    : "/assets/icons/file-upload.svg"
                }
                className="h-80 lg:h-[480px] w-full rounded-[24px] object-cover object-top"
                alt="image"
              />
            </div>
            <p className="text-light-4 text-center small-regular w-full p-4 border-t border-t-dark-4">
              {" "}
              Click or Drag to upload
            </p>
          </>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-light-2 text-sm font-semibold">
            Uploaded Files:
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="relative">
                {uploadedFile.type === "image" ? (
                  <img
                    src={uploadedFile.url}
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
