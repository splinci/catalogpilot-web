"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

export function OrderHeader() {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Orders
        </h1>

        <p className="text-muted-foreground">
          Manage customer orders.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            // Export functionality (Sprint 2)
          }}
        >
          Export Orders
        </Button>

        <Button
          onClick={() => router.push("/orders/new")}
        >
          New Order
        </Button>
      </div>
    </div>
  );
}