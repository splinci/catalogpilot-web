"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Bell, PanelLeftOpen, CheckCheck, ShieldAlert, Info, AlertTriangle, X } from "lucide-react";
import { useSidebar } from "./SidebarContext";

function SidebarHeaderToggle() {
  const { isCollapsed, isHidden, toggleCollapse } = useSidebar();

  if (!isCollapsed && !isHidden) {
    return null;
  }

  return (
    <button
      onClick={toggleCollapse}
      className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs flex items-center justify-center"
      title="Expand Sidebar"
    >
      <PanelLeftOpen className="h-4 w-4 text-indigo-400" />
    </button>
  );
}

interface AppUser {
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  roles?: {
    id: string;
    name: string;
  }[];
}

interface HeaderProps {
  user: AppUser;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: "INFO" | "WARNING" | "CRITICAL";
  isRead: boolean;
  createdAt: string;
}

const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "Operational Command Center";

  // Business Intelligence & Reporting
  if (pathname.startsWith("/reporting/dashboard") || pathname.startsWith("/reports/executive")) return "Executive BI Dashboard";
  if (pathname.startsWith("/reporting/sales") || pathname.startsWith("/reports/sales")) return "Sales Analytics";
  if (pathname.startsWith("/reporting/inventory") || pathname.startsWith("/reports/inventory")) return "Inventory Intelligence";
  if (pathname.startsWith("/reporting/purchasing") || pathname.startsWith("/reports/purchasing")) return "Purchasing Analytics";
  if (pathname.startsWith("/reporting/finance") || pathname.startsWith("/reports/finance")) return "Finance & Accounting Reports";
  if (pathname.startsWith("/reporting/crm") || pathname.startsWith("/reports/crm")) return "CRM Analytics";
  if (pathname.startsWith("/reporting/analytics") || pathname.startsWith("/reports/analytics")) return "Advanced Analytics";
  if (pathname.startsWith("/reporting/scheduled") || pathname.startsWith("/reports/scheduled")) return "Scheduled Reports Automation";
  if (pathname.startsWith("/reporting") || pathname.startsWith("/reports")) return "Business Intelligence Hub";

  // AI Catalog Intelligence
  if (pathname.startsWith("/ai/content")) return "AI Content Generation Studio";
  if (pathname.startsWith("/ai/enrichment")) return "AI Catalog Enrichment & Classification";
  if (pathname.startsWith("/ai/jobs")) return "AI Execution Queue & Jobs";
  if (pathname.startsWith("/ai/prompts")) return "AI System Prompt Templates";
  if (pathname.startsWith("/ai/analytics")) return "AI Intelligence Analytics";
  if (pathname.startsWith("/ai")) return "AI Catalog Intelligence Console";

  // Catalog Management (PIM)
  if (pathname.startsWith("/catalog/dashboard")) return "Catalog Executive Dashboard";
  if (pathname.startsWith("/catalog/workspace")) return "Catalog Authoring Workspace";
  if (pathname.startsWith("/catalog/variants")) return "Product Variants & Options";
  if (pathname.startsWith("/catalog/attributes")) return "Attributes & Schemas";
  if (pathname.startsWith("/catalog/brands")) return "Brand Catalog Management";
  if (pathname.startsWith("/catalog/assets")) return "Digital Asset Management (DAM)";
  if (pathname.startsWith("/catalog/publishing")) return "Omnichannel Publishing Engine";
  if (pathname.startsWith("/catalog/versions")) return "Product Versioning & Change Logs";
  if (pathname.startsWith("/catalog/integrations")) return "Channel Integrations & Connectors";
  if (pathname.startsWith("/catalog/templates")) return "Category Attribute Templates";
  if (pathname.startsWith("/catalog/history")) return "Catalog Revision History";

  if (pathname.startsWith("/products")) return "Product Information Management";
  if (pathname.startsWith("/new-product")) return "Single Product Creator";
  if (pathname.startsWith("/bulk-import")) return "Bulk Product Importer";
  if (pathname.startsWith("/bulk-generator")) return "AI Bulk Catalog Generator";
  if (pathname.startsWith("/categories")) return "Taxonomy & Categories";

  // Operations: Inventory, Warehouses, Purchasing
  if (pathname.startsWith("/inventory/history")) return "Inventory Movement History";
  if (pathname.startsWith("/inventory")) return "Inventory Management System";
  if (pathname.startsWith("/warehouses")) return "Warehouse & Location Operations";
  if (pathname.startsWith("/purchasing")) return "Purchase Orders & Procurement";
  if (pathname.startsWith("/suppliers")) return "Supplier Directory";

  // Sales & CRM
  if (pathname.startsWith("/orders/new")) return "Create Sales Order";
  if (pathname.startsWith("/orders")) return "Sales Order Management";
  if (pathname.startsWith("/customers")) return "Customer Relationship Management";

  // Finance & Accounting
  if (pathname.startsWith("/finance/invoices")) return "Invoices & Billing";
  if (pathname.startsWith("/finance/payments")) return "Payment Collections & Allocations";
  if (pathname.startsWith("/finance/receivables")) return "Accounts Receivable Aging";
  if (pathname.startsWith("/finance/credit-notes")) return "Credit Notes & Adjustments";
  if (pathname.startsWith("/finance")) return "Finance & Ledger Accounting";

  // Workflow Automation
  if (pathname.startsWith("/workflows/executions")) return "Execution Monitoring Workspace";
  if (pathname.startsWith("/workflows/analytics")) return "Workflow Analytics Dashboard";
  if (pathname.startsWith("/workflows")) return "Workflow Automation Engine";

  // Operations & Governance
  if (pathname.startsWith("/operations/go-live-evidence")) return "Go-Live Evidence & Gate 30 Audit";
  if (pathname.startsWith("/operations/certification")) return "Production Certification & Sign-off";
  if (pathname.startsWith("/operations/resilience")) return "Resilience & Disaster Recovery Operations";
  if (pathname.startsWith("/operations/predictive")) return "Predictive Telemetry & Capacity Forecasting";
  if (pathname.startsWith("/operations/stabilization")) return "Production Stabilization Dashboard";
  if (pathname.startsWith("/operations/backup-recovery")) return "Backup & Recovery Operations";
  if (pathname.startsWith("/operations/validation")) return "Scenario Validation & Chaos Drills";
  if (pathname.startsWith("/operations/health")) return "System Telemetry & Component Health";
  if (pathname.startsWith("/operations/incidents")) return "Operational Incidents Command";
  if (pathname.startsWith("/operations/outbox")) return "Transactional Outbox Queue Monitor";
  if (pathname.startsWith("/operations/analytics")) return "Operations Performance Analytics";
  if (pathname.startsWith("/operations/settings")) return "System Configuration & Settings";
  if (pathname.startsWith("/operations/notifications")) return "Operational Alerts & Notifications";
  if (pathname.startsWith("/operations")) return "Operations Command Center";

  // Administration & Security
  if (pathname.startsWith("/administration/audit-logs")) return "Platform Audit & Security Logs";
  if (pathname.startsWith("/administration/sales-channels")) return "Omnichannel Sales Channels";
  if (pathname.startsWith("/onboarding")) return "System Setup Wizard";
  if (pathname.startsWith("/users")) return "User & Team Management";
  if (pathname.startsWith("/developer")) return "Developer API Portal";
  if (pathname.startsWith("/settings")) return "Enterprise Settings";

  return "Splinci Commerce OS";
};

export default function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const [countRes, listRes] = await Promise.all([
        fetch("/api/operations/notifications/unread-count"),
        fetch("/api/operations/notifications?limit=10"),
      ]);

      if (countRes.ok) {
        const countData = await countRes.json();
        if (countData.success && typeof countData.data?.unreadCount === "number") {
          setUnreadCount(countData.data.unreadCount);
        }
      }

      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.success && Array.isArray(listData.data)) {
          setNotifications(listData.data);
        }
      }
    } catch (err) {
      console.error("Failed to load operational notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/operations/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
  const primaryRole = user.roles?.[0]?.name || "ADMIN";
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 shadow-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <SidebarHeaderToggle />

        <h1 className="text-base font-black text-slate-100 tracking-tight">
          {pageTitle}
        </h1>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800 w-72 text-xs">
          <span className="text-slate-400 font-bold">🔍</span>
          <input
            type="text"
            placeholder="Search SKUs, Products, Orders... (Ctrl+K)"
            className="w-full bg-transparent text-slate-200 placeholder-slate-400 focus:outline-hidden font-medium text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Popover Trigger */}
        <div className="relative" ref={popoverRef}>
          <button
            aria-label="Notifications"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) fetchNotifications();
            }}
            className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {/* Notifications Popover Dropdown Card */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                    Notifications & Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/30">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark read
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification List Body */}
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium animate-pulse">
                    Loading telemetry alerts...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 mb-2 border border-slate-800">
                      <ShieldAlert className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="text-xs font-bold text-slate-200">Zero Active System Alerts</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      All operational components and tenant metrics are operating normally.
                    </div>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        item.isRead
                          ? "bg-slate-950/40 border-slate-800/50 text-slate-400"
                          : "bg-indigo-950/20 border-indigo-500/30 text-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-extrabold text-slate-100 flex items-center gap-1.5">
                          {item.type === "CRITICAL" ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          ) : item.type === "WARNING" ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          )}
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Popover Footer Link */}
              <div className="border-t border-slate-800/80 pt-2.5 mt-3 text-center">
                <Link
                  href="/operations/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View All Operations Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-black text-white text-xs tracking-wider shadow-md shadow-indigo-500/20">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <div className="text-xs font-bold text-slate-200 leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-extrabold text-indigo-400 border border-indigo-500/20">
                {primaryRole}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer shadow-md ml-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}