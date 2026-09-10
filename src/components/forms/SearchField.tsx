"use client";

import { Search } from "lucide-react";

interface SearchFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({
  label,
  placeholder = "Search...",
  value,
  onChange,
}: SearchFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-full
            rounded-lg
            border
            border-slate-300
            bg-white
            py-2.5
            pl-10
            pr-4
            text-sm
            shadow-sm
            placeholder:text-slate-400
            focus:border-blue-500
            focus:outline-none
            focus:ring-2
            focus:ring-blue-200
          "
        />
      </div>
    </div>
  );
}