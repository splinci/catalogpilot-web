"use client";

import { PageHero } from "@/components/layout/PageHero";
import { useReceivables } from "@/features/finance/hooks/useReceivables";
import { ReceivablesAgingTable } from "@/features/finance/components/ReceivablesAgingTable";

export default function ReceivablesPage() {
  const { report, loading } = useReceivables();

  return (
    <div className="space-y-6">
      <PageHero
        title="Accounts Receivable Aging Dashboard"
        description="Comprehensive aging analysis categorized into enterprise buckets (Current, 1-30, 31-60, 61-90, 90+ days)."
      />

      <ReceivablesAgingTable report={report} loading={loading} />
    </div>
  );
}
