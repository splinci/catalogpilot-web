"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type DateRange = {
  startDate: string;
  endDate: string;
  label: string;
};

const PRESETS: DateRange[] = [
  { label: "Last 7 Days", startDate: daysAgo(7), endDate: today() },
  { label: "Last 30 Days", startDate: daysAgo(30), endDate: today() },
  { label: "Last 90 Days", startDate: daysAgo(90), endDate: today() },
  { label: "Last 6 Months", startDate: daysAgo(180), endDate: today() },
  { label: "Last Year", startDate: daysAgo(365), endDate: today() },
  { label: "Year to Date", startDate: ytd(), endDate: today() },
];

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().split("T")[0];
}

function ytd(): string {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
}

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
      >
        <Calendar className="h-4 w-4 text-slate-400" />
        {value.label}
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 z-50 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => { onChange(preset); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                value.label === preset.label
                  ? "bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { PRESETS };
