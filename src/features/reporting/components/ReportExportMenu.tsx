"use client";

import { useState } from "react";
import { Download, FileText, Table2, Printer, ChevronDown } from "lucide-react";

interface ReportExportMenuProps {
  reportName?: string;
}

export function ReportExportMenu({ reportName = "Report" }: ReportExportMenuProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: "Export as PDF",
      icon: FileText,
      onClick: () => {
        window.print();
        setOpen(false);
      },
    },
    {
      label: "Export as Excel",
      icon: Table2,
      onClick: () => {
        alert(`Exporting "${reportName}" as Excel... (integration pending)`);
        setOpen(false);
      },
    },
    {
      label: "Export as CSV",
      icon: Download,
      onClick: () => {
        alert(`Exporting "${reportName}" as CSV... (integration pending)`);
        setOpen(false);
      },
    },
    {
      label: "Print Report",
      icon: Printer,
      onClick: () => {
        window.print();
        setOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-xs cursor-pointer"
      >
        <Download className="h-4 w-4 text-slate-400" />
        Export
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 z-50 w-48 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden backdrop-blur-xl">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
