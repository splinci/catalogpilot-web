"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Building2, Layers, Plus, MapPin, ArrowRight, ShieldCheck } from "lucide-react";

interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  city: string;
  zones: number;
  totalBins: number;
  capacityUsed: number;
  status: "ACTIVE" | "MAINTENANCE";
}

export default function WarehouseWmsPage() {
  const [warehouses, setWarehouses] = useState<WarehouseLocation[]>([]);

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Dedicated Warehouse Management System (WMS)"
        description="Manage physical warehouse facilities, aisle zones, bin locations (BIN-A1-04), put-away rules, picking routes, and inter-warehouse stock transfers."
        actions={
          <button
            onClick={() => alert("Creating new warehouse facility...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Warehouse Facility</span>
          </button>
        }
      />

      {/* Warehouse Facilities Cards */}
      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {wh.code}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> {wh.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{wh.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {wh.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Zones &amp; Bins</div>
                    <div className="font-black text-slate-900 mt-0.5">{wh.zones} Zones ({wh.totalBins.toLocaleString()} Bins)</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Capacity Used</div>
                    <div className="font-black text-indigo-600 mt-0.5">{wh.capacityUsed}% Filled</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  onClick={() => alert(`Opening Zone & Bin Mapping for ${wh.code}...`)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 cursor-pointer"
                >
                  <Layers className="h-3.5 w-3.5" /> View Bins &amp; Zones
                </button>

                <button
                  onClick={() => alert(`Initiating stock transfer from ${wh.code}...`)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-all cursor-pointer shadow-xs"
                >
                  Transfer Stock <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center space-y-3 shadow-xs">
          <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">No Warehouse Facilities Configured</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No physical fulfillment facilities or regional hubs configured for this tenant. Click the button above to add a facility.
          </p>
        </div>
      )}
    </div>
  );
}
