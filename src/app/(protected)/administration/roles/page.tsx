"use client";

import { useState } from "react";
import { PageHero } from "@/components/layout/PageHero";
import {
  ShieldCheck,
  Plus,
  Lock,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Sliders,
} from "lucide-react";

interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  usersCount: number;
  permissions: string[];
}

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([
    {
      id: "role_admin",
      name: "Company Administrator",
      code: "ADMIN",
      description: "Full administrative access to company user directory, roles, settings, and catalog domain.",
      isSystem: true,
      usersCount: 1,
      permissions: [
        "company:read", "company:update",
        "users:read", "users:create", "users:update", "users:delete", "users:invite",
        "roles:read", "roles:create", "roles:update", "roles:delete",
        "products:read", "products:create", "products:update", "products:delete", "products:publish",
        "categories:manage", "brands:manage", "attributes:manage",
        "inventory:read", "inventory:update",
        "warehouses:read", "warehouses:create", "warehouses:update", "warehouses:delete",
        "purchase_orders:read", "purchase_orders:create", "purchase_orders:approve",
        "sales_orders:read", "sales_orders:create", "sales_orders:approve",
        "workflows:read", "workflows:create", "workflows:update", "workflows:execute",
        "ai:use", "ai:configure", "analytics:read", "audit_logs:read"
      ],
    },
    {
      id: "role_catalog_mgr",
      name: "Catalog Manager",
      code: "CATALOG_MANAGER",
      description: "Manage product listings, taxonomy categories, brand registry, and AI content enrichment.",
      isSystem: false,
      usersCount: 0,
      permissions: [
        "products:read", "products:create", "products:update", "products:delete", "products:publish",
        "categories:manage", "brands:manage", "attributes:manage",
        "ai:use", "analytics:read"
      ],
    },
    {
      id: "role_inventory_mgr",
      name: "Inventory & Warehouse Operator",
      code: "INVENTORY_OPERATOR",
      description: "Manage physical bin locations, stock adjustments, put-away tasks, and purchase orders.",
      isSystem: false,
      usersCount: 0,
      permissions: [
        "inventory:read", "inventory:update",
        "warehouses:read", "warehouses:update",
        "purchase_orders:read", "purchase_orders:create"
      ],
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[0]);
  const [activeTab, setActiveTab] = useState<"ROLES" | "MATRIX">("ROLES");

  const permissionGroups = [
    {
      group: "Catalog & Master Data",
      permissions: [
        { key: "products:read", label: "View Products" },
        { key: "products:create", label: "Create Products" },
        { key: "products:update", label: "Edit Products" },
        { key: "products:delete", label: "Delete Products" },
        { key: "products:publish", label: "Publish Products to Storefronts" },
        { key: "categories:manage", label: "Manage Categories" },
        { key: "brands:manage", label: "Manage Brand Registry" },
        { key: "attributes:manage", label: "Manage Attributes" },
      ],
    },
    {
      group: "Inventory & WMS Facilities",
      permissions: [
        { key: "inventory:read", label: "View Stock Balances" },
        { key: "inventory:update", label: "Adjust Inventory Levels" },
        { key: "warehouses:read", label: "View Warehouses & Bins" },
        { key: "warehouses:create", label: "Create Warehouse Facilities" },
        { key: "warehouses:update", label: "Manage Bin Configurations" },
      ],
    },
    {
      group: "Administration & User Governance",
      permissions: [
        { key: "company:read", label: "View Company Profile" },
        { key: "company:update", label: "Edit Company Settings" },
        { key: "users:read", label: "View User Directory" },
        { key: "users:invite", label: "Invite Team Members" },
        { key: "users:update", label: "Manage User Access & Roles" },
        { key: "roles:read", label: "View RBAC Roles" },
        { key: "roles:create", label: "Create Custom RBAC Roles" },
        { key: "audit_logs:read", label: "View Security Audit Trail" },
      ],
    },
    {
      group: "AI Engine & Automation Workflows",
      permissions: [
        { key: "ai:use", label: "Execute AI Content Generators" },
        { key: "ai:configure", label: "Configure AI Prompts & Models" },
        { key: "workflows:read", label: "View Workflow Definitions" },
        { key: "workflows:create", label: "Create Automation Workflows" },
        { key: "workflows:execute", label: "Trigger Manual Workflow Tasks" },
      ],
    },
  ];

  const handleTogglePermission = (permKey: string) => {
    if (selectedRole.isSystem) {
      alert("System Administrator role permissions cannot be altered.");
      return;
    }

    const hasPerm = selectedRole.permissions.includes(permKey);
    const updatedPerms = hasPerm
      ? selectedRole.permissions.filter((p) => p !== permKey)
      : [...selectedRole.permissions, permKey];

    const updatedRole = { ...selectedRole, permissions: updatedPerms };
    setSelectedRole(updatedRole);
    setRoles((prev) => prev.map((r) => (r.id === selectedRole.id ? updatedRole : r)));
  };

  return (
    <div className="space-y-8 font-sans">
      <PageHero
        title="Role-Based Access Control (RBAC) &amp; Permissions"
        description="Configure granular role definitions, assign security permission matrices, protect administrative boundaries, and enforce enterprise governance."
        actions={
          <button
            onClick={() => alert("Opening Custom Role Creator...")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Custom Role</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("ROLES")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "ROLES"
              ? "bg-slate-900 text-white font-extrabold shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Defined Roles ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab("MATRIX")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "MATRIX"
              ? "bg-slate-900 text-white font-extrabold shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Granular Permission Matrix
        </button>
      </div>

      {activeTab === "ROLES" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`rounded-2xl border p-6 shadow-xs transition-all space-y-4 cursor-pointer flex flex-col justify-between ${
                selectedRole.id === r.id
                  ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {r.code}
                  </span>
                  {r.isSystem ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <Lock className="h-3 w-3 text-slate-500" /> SYSTEM
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      CUSTOM
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{r.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{r.permissions.length} Active Permissions</span>
                <button
                  onClick={() => {
                    setSelectedRole(r);
                    setActiveTab("MATRIX");
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Edit Matrix &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {selectedRole.code}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                Permission Matrix — {selectedRole.name}
              </h3>
            </div>
            {selectedRole.isSystem && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                <Lock className="h-3.5 w-3.5 text-slate-500" /> Protected System Role
              </span>
            )}
          </div>

          <div className="space-y-6">
            {permissionGroups.map((grp) => (
              <div key={grp.group} className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {grp.group}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {grp.permissions.map((p) => {
                    const isChecked = selectedRole.permissions.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        onClick={() => handleTogglePermission(p.key)}
                        disabled={selectedRole.isSystem}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? "border-emerald-300 bg-emerald-50/40 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        } ${selectedRole.isSystem ? "cursor-not-allowed opacity-90" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.label}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.key}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
