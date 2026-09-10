"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type ImageUploaderProps = {
  onImagesLoaded: (files: File[]) => void;
};

export default function ImageUploader({
  onImagesLoaded,
}: ImageUploaderProps) {
  const [imageCount, setImageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setLoading(true);

      try {
        setImageCount(acceptedFiles.length);
        onImagesLoaded(acceptedFiles);
      } catch (error) {
        console.error(error);
        alert("Failed to upload images.");
      } finally {
        setLoading(false);
      }
    },
    [onImagesLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
      },
      multiple: true,
      onDrop,
    });

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Step 2 · Upload Product Images
      </h2>

      <div
        {...getRootProps()}
        className={`
          cursor-pointer
          rounded-xl
          border-2
          border-dashed
          p-12
          text-center
          transition

          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="text-6xl">🖼️</div>

        <h3 className="mt-6 text-xl font-semibold">
          {isDragActive
            ? "Drop your images here"
            : "Drag & Drop Product Images"}
        </h3>

        <p className="mt-3 text-gray-500">
          or click to browse
        </p>

        <p className="mt-6 text-sm text-gray-400">
          Supported formats: JPG, JPEG, PNG, WEBP
        </p>
      </div>

      {loading && (
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-blue-700">
          Uploading images...
        </div>
      )}

      {imageCount > 0 && (
        <div className="mt-6 rounded-lg border bg-green-50 p-5">
          <p className="font-semibold text-green-700">
            ✅ Images Uploaded Successfully
          </p>

          <p className="mt-2 text-gray-700">
            {imageCount} image(s) uploaded.
          </p>
        </div>
      )}
    </div>
  );
}