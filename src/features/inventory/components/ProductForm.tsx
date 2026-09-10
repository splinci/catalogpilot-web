"use client";

import { useEffect, useState } from "react";

import { DialogActions } from "@/components/common/DialogActions";
import { NumberField } from "@/components/forms/NumberField";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";

import { useProducts } from "@/hooks/useProducts";

import type { Product } from "@/domains/product/types/product";
import type { CreateProductDto } from "@/domains/product/dto/createProduct.dto";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialForm: CreateProductDto = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  barcode: "",
  unit: "EA",
  costPrice: 0,
  sellingPrice: 0,
  minimumStock: 0,
};

export function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const {
    createProduct,
    updateProduct,
  } = useProducts();

  const [form, setForm] =
    useState<CreateProductDto>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description ?? "",
      
        categoryId: product.categoryId ?? "",
        brandId: product.brandId ?? "",
      
        barcode: product.barcode ?? "",
        unit: product.unit ?? "EA",
      
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
      
        minimumStock: product.minimumStock,
      });
    } else {
      setForm(initialForm);
    }
  }, [product]);

  function updateField<
    K extends keyof CreateProductDto
  >(
    field: K,
    value: CreateProductDto[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!(form.unit ?? "").trim()) {
      setError("Unit is required.");
      return;
    }

    try {
      setLoading(true);

      if (product) {
        await updateProduct({
          id: product.id,
          data: {
            sku: form.sku,
            name: form.name,
            description: form.description,
        
            brandId: form.brandId,
            categoryId: form.categoryId,
        
            barcode: form.barcode,
            unit: form.unit,
        
            costPrice: form.costPrice ?? 0,
            sellingPrice: form.sellingPrice ?? 0,
        
            minimumStock: form.minimumStock ?? 0,
        
            currentStock: product.currentStock,
            status: product.status,
          },
        });
      } else {
        await createProduct(form);
      }

      setForm(initialForm);

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          product
            ? "Failed to update product."
            : "Failed to create product."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Product Information
        </h2>

        <p className="text-sm text-slate-500">
          Enter the inventory product details.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          id="sku"
          label="SKU"
          required
          value={form.sku}
          placeholder="SKU-001"
          onChange={(value) =>
            updateField("sku", value)
          }
        />

        <TextField
          id="name"
          label="Product Name"
          required
          value={form.name}
          placeholder="Mechanical Keyboard"
          onChange={(value) =>
            updateField("name", value)
          }
        />

        <TextField
          id="brand"
          label="Brand"
          value={form.brandId ?? ""}
          placeholder="Logitech"
          onChange={(value) =>
            updateField("brandId", value)
          }
        />

        <TextField
          id="categoryId"
          label="CategoryId"
          value={form.categoryId ?? ""}
          placeholder="Electronics"
          onChange={(value) =>
            updateField("categoryId", value)
          }
        />

        <TextField
          id="barcode"
          label="Barcode"
          value={form.barcode ?? ""}
          placeholder="1234567890123"
          onChange={(value) =>
            updateField("barcode", value)
          }
        />

        <TextField
          id="unit"
          label="Unit"
          required
          value={form.unit ?? ""}
          placeholder="EA"
          onChange={(value) =>
            updateField("unit", value)
          }
        />

        <NumberField
          id="costPrice"
          label="Cost Price"
          required
          min={0}
          step={0.01}
          value={form.costPrice}
          placeholder="0.00"
          onChange={(value) =>
            updateField("costPrice", value)
          }
        />

        <NumberField
          id="sellingPrice"
          label="Selling Price"
          required
          min={0}
          step={0.01}
          value={form.sellingPrice}
          placeholder="0.00"
          onChange={(value) =>
            updateField("sellingPrice", value)
          }
        />
        <NumberField
  id="minimumStock"
  label="Minimum Stock"
  min={0}
  step={1}
  value={form.minimumStock ?? 0}
  placeholder="10"
  onChange={(value) =>
    updateField("minimumStock", value)
  }
/>
      </div>

      <TextareaField
        id="description"
        label="Description"
        value={form.description ?? ""}
        placeholder="Enter product description..."
        rows={4}
        onChange={(value) =>
          updateField("description", value)
        }
      />

      <DialogActions
        loading={loading}
        onCancel={onCancel}
        submitLabel={
          product
            ? "Update Product"
            : "Save Product"
        }
      />
    </form>
  );
}