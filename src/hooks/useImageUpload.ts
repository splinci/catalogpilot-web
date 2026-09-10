"use client";

import { useState } from "react";
import { UploadedImage } from "@/types/bulk";

export function useImageUpload() {
  const [images, setImages] = useState<UploadedImage[]>([]);

  const addImages = (files: File[]) => {
    const uploaded = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      size: file.size,
      matched: false,
    }));

    setImages((prev) => [...prev, ...uploaded]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearImages = () => {
    setImages([]);
  };

  return {
    images,
    addImages,
    removeImage,
    clearImages,
  };
}