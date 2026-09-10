import { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
};

export function DataTable({
  children,
}: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        {children}
      </table>
    </div>
  );
}