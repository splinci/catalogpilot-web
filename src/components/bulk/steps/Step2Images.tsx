"use client";

import ImageUploader from "../ImageUploader";
import CompletedImagesCard from "../CompletedImagesCard";
import { BulkProduct } from "@/types/bulk";

type Props = {
  currentStep: number;

  products: BulkProduct[];

  images: File[];

  onImagesLoaded: (files: File[]) => void;

  onReplaceImages: () => void;
};

export default function Step2Images({
  currentStep,
  products,
  images,
  onImagesLoaded,
  onReplaceImages,
}: Props) {

  if (products.length === 0) {
    return null;
  }

  if (currentStep === 2) {
    return (
      <ImageUploader
        onImagesLoaded={onImagesLoaded}
      />
    );
  }

  return (
    <CompletedImagesCard
      imageCount={images.length}
      onReplace={onReplaceImages}
    />
  );
}