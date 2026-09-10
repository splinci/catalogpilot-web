"use client";

import React from "react";
import { PageHero } from "@/components/layout/PageHero";
import { useAIEnrichment } from "@/features/ai/hooks/useAIEnrichment";
import { useAIClassification } from "@/features/ai/hooks/useAIClassification";
import { AIEnrichmentPanel } from "@/features/ai/components/AIEnrichmentPanel";
import { AIClassificationPanel } from "@/features/ai/components/AIClassificationPanel";

export default function CatalogEnrichmentPage() {
  const { enrichProduct, approveEnrichment, rejectEnrichment } = useAIEnrichment();
  const { classifyProduct } = useAIClassification();

  return (
    <div className="space-y-8">
      <PageHero
        title="Catalog Enrichment & Classification"
        description="Enrich master product records, inspect original vs AI proposals, and predict taxonomy with machine learning confidence scores."
        badge="AI Data Enrichment"
      />

      <div className="grid grid-cols-1 gap-8">
        <AIEnrichmentPanel
          onEnrich={enrichProduct}
          onApprove={approveEnrichment}
          onReject={rejectEnrichment}
        />

        <AIClassificationPanel
          onClassify={(productId) => classifyProduct({ productId })}
        />
      </div>
    </div>
  );
}
