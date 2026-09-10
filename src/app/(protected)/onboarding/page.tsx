"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Compass, CheckCircle2, ArrowRight, Building2, Sparkles, Store } from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="space-y-8">
      <PageHero
        title="Customer Onboarding & Guided Setup Wizard"
        description="Welcome to Atlas Commerce OS! Follow this 4-step wizard to configure your company parameters, master attributes, sales channels, and seed initial demo products."
      />

      {/* Step Progress Tracker */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { step: 1, title: "1. Company Setup", icon: Building2 },
          { step: 2, title: "2. Master Attributes", icon: Sparkles },
          { step: 3, title: "3. Sales Channels", icon: Store },
          { step: 4, title: "4. Seed Demo Data", icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon;
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div
              key={item.step}
              className={`rounded-2xl border p-4 transition-all flex items-center gap-3 ${
                isCurrent
                  ? "border-indigo-600 bg-indigo-50/30 shadow-xs"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-slate-200/80 bg-white"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDone
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-xs text-slate-800">{item.title}</span>
            </div>
          );
        })}
      </div>

      {/* Wizard Active Step Content Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Step 1: Configure Organization & Currency</h3>
            <p className="text-xs text-slate-500 font-medium">Enter primary company legal name, tax ID, and base currency.</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <input type="text" defaultValue="Atlas Commerce Ltd." className="w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-800" />
              <input type="text" defaultValue="USD ($)" className="w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-800" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Step 2: Seed Default Master Attributes</h3>
            <p className="text-xs text-slate-500 font-medium">Initialize standard commerce attributes (Voltage, Material, Weight, Color).</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700">Voltage (110V, 220V)</span>
              <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700">Material (Aluminium, Mesh)</span>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Step 3: Connect Sales Channels</h3>
            <p className="text-xs text-slate-500 font-medium">Select connected storefronts for automatic Phase 6.5 synchronization.</p>
            <div className="grid grid-cols-3 gap-3 text-xs font-bold">
              <div className="rounded-xl border border-indigo-300 bg-indigo-50 p-4 text-indigo-700">🌐 Online Web Store</div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">📦 Amazon Marketplace</div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">🏬 Retail POS</div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 text-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Setup Complete! Ready for Operations</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              Your Atlas Commerce OS instance is fully configured and seeded with sample product data.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            Back
          </button>

          <button
            onClick={() => {
              if (currentStep < 4) setCurrentStep((prev) => prev + 1);
              else alert("Navigating to Executive Overview Dashboard!");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-xs"
          >
            <span>{currentStep === 4 ? "Go to Dashboard" : "Continue to Next Step"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
