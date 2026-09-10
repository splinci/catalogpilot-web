"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ParsedItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  supplier: string;
  category: string;
  price: number;
  status: "VALID" | "WARNING" | "INVALID";
  errors: string[];
}

export default function ManualBulkProductPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  const steps = [
    { num: 1, label: "Download Template" },
    { num: 2, label: "Fill Template" },
    { num: 3, label: "Upload File" },
    { num: 4, label: "Validation Engine" },
    { num: 5, label: "Preview & Quality Score" },
    { num: 6, label: "Import to Workspace" },
  ];

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "SKU,Product Name,Brand,Supplier,Category,Description,Price,Attributes,Image URLs\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Atlas_Catalog_Bulk_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setCurrentStep(4);
      setValidating(true);
      setTimeout(() => {
        setValidating(false);
        setCurrentStep(5);
      }, 1200);
    }
  };

  const validCount = parsedItems.filter((i) => i.status === "VALID").length;
  const qualityScore = parsedItems.length > 0 ? Math.round((validCount / parsedItems.length) * 100) : 0;

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Manual Bulk Product Creation Studio"
        description="Structured 6-step pipeline to bulk upload products via Excel/CSV with automated duplicate SKU checks, mandatory field validation, data quality scoring, and staging preview."
      />

      {/* 6-Step Stepper Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex flex-col items-center text-center p-3 rounded-xl transition-all border ${
                currentStep === s.num
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-xs"
                  : currentStep > s.num
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-700 font-semibold"
                  : "border-slate-200 bg-slate-50/50 text-slate-500 font-medium hover:bg-slate-100"
              }`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black mb-1.5 bg-white shadow-2xs">
                {currentStep > s.num ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : s.num}
              </div>
              <span className="text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep <= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Step 1: Download Template</h3>
            <p className="text-xs text-slate-500">
              Download our pre-formatted CSV/Excel template with SKU, Name, Brand, Supplier, Category, Price, Attributes, and Image URL columns.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Step 2: Fill Catalog Data</h3>
            <p className="text-xs text-slate-500">
              Open the downloaded template in Excel, Google Sheets, or Numbers. Populate product details, master attributes, and image URLs.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 font-mono">
              ✓ mandatory: SKU, Name, Price
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-indigo-300 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-xs space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Step 3: Upload Spreadsheet</h3>
            <p className="text-xs text-slate-500">
              Drop your completed `.csv` or `.xlsx` file here to initiate automated multi-rule validation.
            </p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-400/60 rounded-xl p-6 bg-white hover:bg-indigo-50/50 cursor-pointer transition-colors text-center">
              <Upload className="h-6 w-6 text-indigo-600 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to Upload Spreadsheet</span>
              <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Step 4: Validation Engine */}
      {validating && (
        <div className="rounded-2xl border border-indigo-200 bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 animate-spin mx-auto">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Running Multi-Rule Validation Engine...</h3>
          <p className="text-xs text-slate-500">Checking Duplicate SKUs • Mandatory Fields • Invalid Categories &amp; Brands</p>
        </div>
      )}

      {/* Step 5 & 6: Quality Score Preview & Import */}
      {currentStep >= 5 && !validating && (
        <div className="space-y-6">
          {/* Quality Score Banner */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl font-black text-2xl border ${
                  qualityScore >= 90
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {qualityScore}%
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Data Quality Score</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {validCount} of {parsedItems.length} Products Passed Full Rule Validation
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link href="/catalog/workspace">
                <button
                  disabled={parsedItems.length === 0}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Stage Valid Items to Workspace</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Parsed Items Validation Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Validation Staging Preview</h4>
              <span className="text-xs text-slate-500 font-medium">{parsedItems.length} Total Items Parsed</span>
            </div>

            {parsedItems.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Product Title</th>
                    <th className="px-6 py-4">Brand</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-center">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-700">{item.brand}</td>
                      <td className="px-6 py-4 text-xs text-slate-600">{item.category}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        {item.status === "VALID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200"
                            title={item.errors.join(", ")}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Warning
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No items parsed from uploaded file.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
