import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";

export function InventoryHero() {
  return (
    <PageHero
      title="Inventory"
      description="Manage products across Atlas."
      actions={
        <Button>
          + Add Product
        </Button>
      }
    />
  );
}