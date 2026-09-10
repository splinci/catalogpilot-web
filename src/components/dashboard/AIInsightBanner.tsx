"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, AlertTriangle } from "lucide-react";
import { AIRecommendation } from "@/types/dashboard";

interface AIInsightBannerProps {
  recommendation?: AIRecommendation;
}

export default function AIInsightBanner({ recommendation }: AIInsightBannerProps) {
  if (!recommendation) return null;

  const isWarning = recommendation.severity === "warning";

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 mb-6 shadow-xs transition-all ${
        isWarning
          ? "border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/30 text-amber-950"
          : "border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-emerald-50/30 text-emerald-950"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isWarning
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
                : "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 inline" />
                Splinci AI Insight Engine
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mt-0.5">
              {recommendation.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl leading-relaxed">
              {recommendation.message}
            </p>
          </div>
        </div>

        {recommendation.actionLabel && recommendation.actionHref && (
          <Link
            href={recommendation.actionHref}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-xs transition-all shrink-0 ${
              isWarning
                ? "bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800"
                : "bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900"
            }`}
          >
            <span>{recommendation.actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
