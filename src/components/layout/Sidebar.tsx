"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Box,
  Layers,
  Sliders,
  Tags,
  Shapes,
  FileText,
  Store,
  History,
  Settings,
  Boxes,
  Building2,
  Truck,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  Compass,
  ShieldCheck,
  Code2,
  Wand2,
  LogOut,
  User,
  ShieldAlert,
  Cpu,
  Code,
  Activity,
  TrendingUp,
  Package,
  CalendarClock,
  PanelLeftClose,
  PanelLeftOpen,
  Inbox,
  Bell,
  CheckCircle2,
  Lock,
  GitBranch,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    isPlatformAdmin?: boolean;
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Executive Command Center",
    items: [
      {
        title: "Operational Command",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Executive BI Dashboard",
        href: "/reporting/dashboard",
        icon: Activity,
      },
    ],
  },
  {
    title: "Catalog Workspace",
    items: [
      {
        title: "Catalog Executive View",
        href: "/catalog/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Authoring Workspace",
        href: "/catalog/workspace",
        icon: Wand2,
      },
      {
        title: "Single Product Generator",
        href: "/catalog/manual/single",
        icon: Box,
      },
      {
        title: "Bulk AI Generator",
        href: "/bulk-generator",
        icon: Boxes,
      },
    ],
  },
  {
    title: "Master PIM Management",
    items: [
      {
        title: "Live Product Index",
        href: "/products",
        icon: Package,
      },
      {
        title: "Taxonomy & Categories",
        href: "/categories",
        icon: Layers,
      },
      {
        title: "Master Brand Registry",
        href: "/catalog/brands",
        icon: Store,
      },
      {
        title: "Attributes & Schemas",
        href: "/catalog/attributes",
        icon: Sliders,
      },
      {
        title: "Digital Assets (DAM)",
        href: "/catalog/assets",
        icon: FileText,
      },
      {
        title: "Variants & Matrix",
        href: "/catalog/variants",
        icon: Shapes,
      },
      {
        title: "Template Rules",
        href: "/catalog/templates",
        icon: Tags,
      },
      {
        title: "Version Control",
        href: "/catalog/versions",
        icon: History,
      },
      {
        title: "Publishing Channels",
        href: "/catalog/publishing",
        icon: Compass,
      },
    ],
  },
  {
    title: "AI Commerce Intelligence",
    items: [
      {
        title: "AI Intelligence Hub",
        href: "/ai",
        icon: Sparkles,
      },
      {
        title: "AI Content Studio",
        href: "/ai/content",
        icon: Wand2,
      },
      {
        title: "AI Single Generator",
        href: "/catalog/ai/single",
        icon: Cpu,
      },
      {
        title: "AI Bulk Generator",
        href: "/catalog/ai/bulk",
        icon: Boxes,
      },
      {
        title: "AI Catalog Enrichment",
        href: "/ai/enrichment",
        icon: Layers,
      },
      {
        title: "AI Execution Queue",
        href: "/ai/jobs",
        icon: Activity,
      },
      {
        title: "AI System Prompts",
        href: "/ai/prompts",
        icon: Code,
      },
      {
        title: "AI Economics & Analytics",
        href: "/ai/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Workflow Automation",
    items: [
      {
        title: "Automation Engine",
        href: "/workflows",
        icon: Zap,
      },
      {
        title: "Execution Monitor",
        href: "/workflows/executions",
        icon: History,
      },
      {
        title: "Workflow Analytics",
        href: "/workflows/analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Inventory & Warehouse Ops",
    items: [
      {
        title: "Inventory Control Hub",
        href: "/inventory",
        icon: Boxes,
      },
      {
        title: "Stock Movement Audit",
        href: "/inventory/history",
        icon: History,
      },
      {
        title: "Warehouse Network",
        href: "/warehouses",
        icon: Building2,
      },
    ],
  },
  {
    title: "Purchasing & Procurement",
    items: [
      {
        title: "Purchasing Orders",
        href: "/purchasing",
        icon: ShoppingCart,
      },
      {
        title: "Master Supplier Directory",
        href: "/suppliers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Order Management (OMS)",
    items: [
      {
        title: "Sales Order Central",
        href: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Create Sales Order",
        href: "/orders/new",
        icon: Box,
      },
    ],
  },
  {
    title: "Customer Relationship (CRM)",
    items: [
      {
        title: "Customer Directory",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Add Enterprise Customer",
        href: "/customers/new",
        icon: User,
      },
    ],
  },
  {
    title: "Finance & Accounting",
    items: [
      {
        title: "Finance Control Hub",
        href: "/finance",
        icon: DollarSign,
      },
      {
        title: "Accounts Receivable",
        href: "/finance/receivables",
        icon: CalendarClock,
      },
      {
        title: "Billing Invoices",
        href: "/finance/invoices",
        icon: FileText,
      },
      {
        title: "Payment Records",
        href: "/finance/payments",
        icon: Zap,
      },
      {
        title: "Credit Notes Registry",
        href: "/finance/credit-notes",
        icon: ShieldAlert,
      },
    ],
  },
  {
    title: "Business Intelligence",
    items: [
      {
        title: "BI Hub Workspace",
        href: "/reporting",
        icon: BarChart3,
      },
      {
        title: "Executive BI Dashboard",
        href: "/reporting/dashboard",
        icon: Activity,
      },
      {
        title: "Executive KPI Summary",
        href: "/reporting/executive",
        icon: TrendingUp,
      },
      {
        title: "Interactive Analytics",
        href: "/reporting/analytics",
        icon: BarChart3,
      },
      {
        title: "Scheduled Subscriptions",
        href: "/reporting/scheduled",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "Operations & Governance",
    items: [
      {
        title: "Operations Command",
        href: "/operations",
        icon: Activity,
      },
      {
        title: "Go-Live & Gate 30 Audit",
        href: "/operations/go-live-evidence",
        icon: CheckCircle2,
        badge: "GATE 30",
      },
      {
        title: "System Health Telemetry",
        href: "/operations/health",
        icon: Cpu,
      },
      {
        title: "Production Certification",
        href: "/operations/certification",
        icon: ShieldCheck,
      },
      {
        title: "Operational Incidents",
        href: "/operations/incidents",
        icon: ShieldAlert,
      },
      {
        title: "Outbox Queue Monitor",
        href: "/operations/outbox",
        icon: Inbox,
      },
      {
        title: "Resilience & DR",
        href: "/operations/resilience",
        icon: GitBranch,
      },
      {
        title: "Predictive Forecasting",
        href: "/operations/predictive",
        icon: TrendingUp,
      },
      {
        title: "Operations Analytics",
        href: "/operations/analytics",
        icon: BarChart3,
      },
      {
        title: "System Settings",
        href: "/operations/settings",
        icon: Settings,
      },
      {
        title: "Alert Notifications",
        href: "/operations/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "Company Administration",
    items: [
      {
        title: "Company Profile",
        href: "/administration/company",
        icon: Building2,
      },
      {
        title: "User Management",
        href: "/administration/users",
        icon: Users,
      },
      {
        title: "Roles & Permissions",
        href: "/administration/roles",
        icon: ShieldCheck,
      },
      {
        title: "Audit Logs",
        href: "/administration/audit-logs",
        icon: ShieldAlert,
      },
    ],
  },
  {
    title: "Platform Administration",
    items: [
      {
        title: "Client Onboarding",
        href: "/admin/merchants/onboard",
        icon: Building2,
        badge: "MERCHANT OPS",
      },
      {
        title: "Client Directory",
        href: "/admin/merchants",
        icon: Store,
        badge: "TENANTS",
      },
      {
        title: "User Directory",
        href: "/administration/users",
        icon: Users,
        badge: "COMPANY TEAM",
      },
      {
        title: "Sales Channels",
        href: "/administration/sales-channels",
        icon: Compass,
      },
      {
        title: "Security Audit Logs",
        href: "/administration/audit-logs",
        icon: ShieldCheck,
      },
      {
        title: "Developer API & Hooks",
        href: "/developer",
        icon: Code2,
      },
      {
        title: "Global Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

const exactRouteParents = [
  "/",
  "/ai",
  "/reporting",
  "/reports",
  "/finance",
  "/inventory",
  "/purchasing",
  "/orders",
  "/customers",
  "/catalog/dashboard",
  "/reporting/dashboard",
  "/workflows",
  "/operations",
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isHidden, toggleCollapse } = useSidebar();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors
    } finally {
      window.location.href = "/login";
    }
  }

  if (isHidden) {
    return null;
  }

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } border-r border-slate-800/80 bg-slate-950/95 text-slate-100 h-screen sticky top-0 flex flex-col justify-between shadow-2xl transition-all duration-300 ease-in-out shrink-0 select-none z-30`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header & Toggle */}
        <div
          className={`border-b border-slate-800/80 shrink-0 ${
            isCollapsed ? "px-2 py-3.5 flex flex-col items-center gap-3" : "px-4 py-4 flex items-center justify-between"
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="truncate transition-opacity duration-200">
                <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Splinci
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                    Commerce OS v1.0
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={isCollapsed ? "Expand Sidebar (Widen)" : "Collapse Sidebar (Compact)"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-indigo-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {navSections.map((section, idx) => {
            const isPlatformSection = section.title === "Platform Administration" || section.title === "Operations & Governance";
            if (isPlatformSection && !user?.isPlatformAdmin) {
              return null;
            }

            const userRole = user?.role || "MERCHANT_USER";
            const isAdmin = userRole === "ADMIN" || userRole === "PLATFORM_ADMIN";

            if (!isAdmin) {
              if (section.title === "Company Administration" && userRole !== "ADMIN") return null;
              if (section.title === "Inventory & Warehouse Ops" && userRole !== "WAREHOUSE_MANAGER" && userRole !== "EXECUTIVE") return null;
              if (section.title === "Purchasing & Procurement" && userRole !== "PURCHASING_OFFICER" && userRole !== "EXECUTIVE") return null;
              if (section.title === "Order Management (OMS)" && userRole !== "SALES_MANAGER" && userRole !== "SALES_REPRESENTATIVE" && userRole !== "EXECUTIVE") return null;
              if (section.title === "Customer Relationship (CRM)" && userRole !== "SALES_MANAGER" && userRole !== "SALES_REPRESENTATIVE" && userRole !== "EXECUTIVE") return null;
              if (section.title === "Finance & Accounting" && userRole !== "FINANCE_CLERK" && userRole !== "FINANCE_AUDITOR" && userRole !== "EXECUTIVE") return null;
            }

            return (
              <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <h2 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                  {section.title}
                </h2>
              ) : (
                <div className="h-px bg-slate-800/60 my-2" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isParentRoute = exactRouteParents.includes(item.href);
                  const isActive = isParentRoute
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={`flex items-center ${
                        isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                      } rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-500/20 font-bold"
                          : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-amber-300" : "text-slate-400 group-hover:text-slate-200"}`} />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="ml-2 inline-flex items-center rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-300 border border-indigo-500/30 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
        </nav>

        {/* User Profile Footer */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950 shrink-0">
          <div
            title={isCollapsed ? (user?.name || user?.email || "User Account") : undefined}
            className={`flex items-center ${
              isCollapsed ? "justify-center p-2" : "justify-between p-2.5"
            } rounded-xl bg-slate-900/80 border border-slate-800/80`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {user?.name || user?.email || "User Account"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 truncate">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}