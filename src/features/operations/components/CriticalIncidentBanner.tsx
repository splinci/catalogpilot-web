/**
 * ============================================================================
 * Splinci Commerce OS — CriticalIncidentBanner Component
 * ============================================================================
 * Specification Reference: M12-004 / UI-001
 * Displays urgent banner alerts when critical incidents are active
 * ============================================================================
 */

import React from "react";
import { AlertOctagon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { IncidentItemDto } from "@/types/operations.dto";

export function CriticalIncidentBanner({ incidents }: { incidents: IncidentItemDto[] }) {
  if (!incidents || incidents.length === 0) return null;

  return (
    <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-200 flex items-center justify-between shadow-lg animate-pulse">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-900/50 rounded-lg text-red-400">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-red-100">
            {incidents.length} Critical Operational Incident{incidents.length > 1 ? "s" : ""} Active
          </h4>
          <p className="text-xs text-red-300/90">
            {incidents[0]?.title} — Requires immediate operational triage.
          </p>
        </div>
      </div>

      <Link
        href="/operations/incidents"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition shrink-0"
      >
        View Incidents <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
