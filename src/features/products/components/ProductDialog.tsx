"use client";

import { useEffect, useState } from "react";

import type { Product } from "@/domains/product/types/product";

import { useProducts } from "@/hooks/useProducts";
import { useBrands } from "@/features/brand/hooks/useBrands";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
}: ProductDialogProps) {
  const { updateProduct, updating } = useProducts();

  const { brands } = useBrands();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const [currentStock, setCurrentStock] = useState(0);
  const [minimumStock, setMinimumStock] = useState(0);

  const [status, setStatus] = useState<
    "ACTIVE" | "INACTIVE"
  >("ACTIVE");

  useEffect(() => {
    if (!product) return;

    setSku(product.sku);
    setName(product.name);

    setBrandId(product.brandId ?? "");
    setCategoryId(product.categoryId ?? "");
    setSupplierId(product.supplierId ?? "");

    setCostPrice(product.costPrice);
    setSellingPrice(product.sellingPrice);

    setCurrentStock(product.currentStock);
    setMinimumStock(product.minimumStock);

    setStatus(product.status);
  }, [product, open]);

  async function handleSubmit() {
    if (!product) return;

    await updateProduct({
      id: product.id,
      data: {
        sku,
        name,
        description: product.description ?? "",

        brandId,
        categoryId,
        supplierId,

        barcode: product.barcode ?? "",
        unit: product.unit ?? "",

        costPrice,
        sellingPrice,

        currentStock,
        minimumStock,

        status,
      },
    });

    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sku">SKU</Label>

            <Input
              id="sku"
              value={sku}
              onChange={(e) =>
                setSku(e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="name">
              Product Name
            </Label>

            <Input
              id="name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="brand">
              Brand
            </Label>

            <select
              id="brand"
              className="w-full rounded-md border px-3 py-2"
              value={brandId}
              onChange={(e) =>
                setBrandId(e.target.value)
              }
            >
              <option value="">
                Select Brand
              </option>

              {brands.map((brand) => (
                <option
                  key={brand.id}
                  value={brand.id}
                >
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="category">
              Category
            </Label>

            <select
              id="category"
              className="w-full rounded-md border px-3 py-2"
              value={categoryId}
              onChange={(e) =>
                setCategoryId(e.target.value)
              }
            >
              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="supplier">
              Supplier
            </Label>

            <select
              id="supplier"
              className="w-full rounded-md border px-3 py-2"
              value={supplierId}
              onChange={(e) =>
                setSupplierId(e.target.value)
              }
            >
              <option value="">
                Select Supplier
              </option>

              {suppliers.map((supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="costPrice">
              Cost Price
            </Label>

            <Input
              id="costPrice"
              type="number"
              value={costPrice}
              onChange={(e) =>
                setCostPrice(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="sellingPrice">
              Selling Price
            </Label>

            <Input
              id="sellingPrice"
              type="number"
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="currentStock">
              Current Stock
            </Label>

            <Input
              id="currentStock"
              type="number"
              value={currentStock}
              onChange={(e) =>
                setCurrentStock(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="minimumStock">
              Minimum Stock
            </Label>

            <Input
              id="minimumStock"
              type="number"
              value={minimumStock}
              onChange={(e) =>
                setMinimumStock(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="status">
              Status
            </Label>

            <select
              id="status"
              className="w-full rounded-md border px-3 py-2"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as
                    | "ACTIVE"
                    | "INACTIVE"
                )
              }
            >
              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={updating}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}