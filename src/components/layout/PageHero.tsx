import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

type PageHeroProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
};

export function PageHero({
  title,
  description,
  actions,
  badge = "Commerce OS",
}: PageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{badge}</span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}