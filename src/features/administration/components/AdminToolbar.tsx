"use client";

import { Button } from "@/components/ui/Button";
import  Input  from "@/components/ui/Input";

interface AdminToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  addLabel: string;
  onAdd: () => void;

  children?: React.ReactNode;
}

export function AdminToolbar({
  search,
  onSearchChange,
  addLabel,
  onAdd,
  children,
}: AdminToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          className="max-w-sm"
        />

        {children}
      </div>

      <Button onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  );
}