"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface AIConfidenceBadgeProps {
  confidence: number;
}

export const AIConfidenceBadge: React.FC<AIConfidenceBadgeProps> = ({ confidence }) => {
  const percentage = Math.round(confidence * (confidence <= 1 ? 100 : 1));
  
  let color = "text-purple-400 bg-purple-500/10 border-purple-500/20";
  if (percentage < 85) color = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  if (percentage < 60) color = "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${color}`}>
      <Sparkles className="w-3.5 h-3.5" />
      <span>{percentage}% Confidence</span>
    </div>
  );
};
