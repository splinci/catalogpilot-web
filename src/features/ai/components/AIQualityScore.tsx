"use client";

import React from "react";
import { Award } from "lucide-react";

interface AIQualityScoreProps {
  score: number;
  showIcon?: boolean;
}

export const AIQualityScore: React.FC<AIQualityScoreProps> = ({ score, showIcon = true }) => {
  let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (score < 70) color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
  if (score < 50) color = "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${color}`}>
      {showIcon && <Award className="w-3.5 h-3.5" />}
      <span>{score}/100 Quality</span>
    </div>
  );
};
