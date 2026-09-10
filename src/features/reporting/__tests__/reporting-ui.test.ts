import { describe, it, expect } from "vitest";

describe("Reporting UI Feature Modules", () => {
  it("should exports hooks properly", async () => {
    const hooks = await import("../hooks/useDashboard");
    expect(hooks.useDashboard).toBeDefined();
  });

  it("should exports components properly", async () => {
    const kpiCards = await import("../components/ExecutiveKPICards");
    expect(kpiCards.ExecutiveKPICards).toBeDefined();
    expect(kpiCards.ExecutiveKPICard).toBeDefined();

    const healthCard = await import("../components/BusinessHealthCard");
    expect(healthCard.BusinessHealthCard).toBeDefined();

    const skeletons = await import("../components/LoadingSkeleton");
    expect(skeletons.LoadingSkeleton).toBeDefined();
    expect(skeletons.KPICardSkeleton).toBeDefined();
    expect(skeletons.ChartSkeleton).toBeDefined();
    expect(skeletons.TableSkeleton).toBeDefined();
  });
});
