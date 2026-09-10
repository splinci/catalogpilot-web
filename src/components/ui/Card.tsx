import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function Card({
  title,
  action,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            )}
          </div>

          {action && (
            <div className="flex items-center">
              {action}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}