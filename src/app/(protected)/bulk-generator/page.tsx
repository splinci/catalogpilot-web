"use client";

import BulkWizard from "@/components/bulk/BulkWizard";
import { PageHero } from "@/components/layout/PageHero";

export default function BulkGeneratorPage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="Bulk AI Catalog Generator"
        description="Upload catalog spreadsheets and product images to generate AI-powered multi-channel listings in bulk."
      />

      <BulkWizard />
    </div>
  );
}