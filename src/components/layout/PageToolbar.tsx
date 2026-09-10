import { ReactNode } from "react";

type PageToolbarProps = {
  left?: ReactNode;
  right?: ReactNode;
};

export function PageToolbar({
  left,
  right,
}: PageToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {left}
      </div>

      <div className="flex items-center gap-3">
        {right}
      </div>
    </div>
  );
}