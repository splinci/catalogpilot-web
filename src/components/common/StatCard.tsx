import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  valueClassName?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueClassName = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden">
      {/* Top Gradient Glow Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${valueClassName}`}>
            {value}
          </p>

          {subtitle && (
            <p className="mt-1.5 text-xs font-medium text-slate-500 leading-normal">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="rounded-xl bg-slate-900 p-2.5 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}