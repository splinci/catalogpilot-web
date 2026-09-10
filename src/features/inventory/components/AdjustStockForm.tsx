"use client";

import { useState } from "react";

import { useInventoryTransactions } from "@/hooks/useInventoryTransactions";
import { DialogActions } from "@/components/common/DialogActions";
import { NumberField } from "@/components/forms/NumberField";
import { SelectField } from "@/components/forms/SelectField";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";

enum InventoryTransactionType {
  ADJUSTMENT_IN = "ADJUSTMENT_IN",
  ADJUSTMENT_OUT = "ADJUSTMENT_OUT",
}

interface AdjustStockFormProps {
  product: {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
  };
  onSuccess?: () => void;
  onCancel: () => void;
}

interface FormState {
  type: InventoryTransactionType;
  quantity: number;
  reference: string;
  remarks: string;
}

const transactionTypeOptions = [
  {
    value: InventoryTransactionType.ADJUSTMENT_IN,
    label: "Adjustment In",
  },
  {
    value: InventoryTransactionType.ADJUSTMENT_OUT,
    label: "Adjustment Out",
  },
];

export function AdjustStockForm({
  product,
  onSuccess,
  onCancel,
}: AdjustStockFormProps) {
  const { adjustStock } = useInventoryTransactions();

  const [form, setForm] = useState<FormState>({
    type: InventoryTransactionType.ADJUSTMENT_IN,
    quantity: 1,
    reference: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validate(): string | null {
    if (form.quantity <= 0) {
      return "Quantity must be greater than zero.";
    }

    if (
      form.type === InventoryTransactionType.ADJUSTMENT_OUT &&
      form.quantity > product.currentStock
    ) {
      return "Quantity exceeds current stock.";
    }

    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await adjustStock({
        productId: product.id,
        data: {
          type: form.type,
          quantity: form.quantity,
          reference: form.reference || undefined,
          remarks: form.remarks || undefined,
        },
      });

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to adjust stock."
      );
    } finally {
      setLoading(false);
    }
  }
  const resultingStock =
    form.type === InventoryTransactionType.ADJUSTMENT_IN
      ? product.currentStock + form.quantity
      : product.currentStock - form.quantity;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          id="product-name"
          label="Product"
          value={product.name}
          disabled
          onChange={() => {}}
        />

        <TextField
          id="product-sku"
          label="SKU"
          value={product.sku}
          disabled
          onChange={() => {}}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NumberField
          id="current-stock"
          label="Current Stock"
          value={product.currentStock}
          disabled
          onChange={() => {}}
        />

        <NumberField
          id="resulting-stock"
          label="Resulting Stock"
          value={resultingStock}
          disabled
          onChange={() => {}}
        />
      </div>

      <SelectField
        id="transaction-type"
        label="Transaction Type"
        value={form.type}
        options={transactionTypeOptions}
        required
        onChange={(value) =>
          updateField(
            "type",
            value as InventoryTransactionType
          )
        }
      />

      <NumberField
        id="quantity"
        label="Quantity"
        value={form.quantity}
        required
        min={1}
        onChange={(value) =>
          updateField("quantity", Number(value))
        }
      />

      <TextField
        id="reference"
        label="Reference"
        value={form.reference}
        placeholder="PO-10025, Manual Adjustment..."
        onChange={(value) =>
          updateField("reference", value)
        }
      />

      <TextareaField
        id="remarks"
        label="Remarks"
        value={form.remarks}
        placeholder="Reason for this adjustment..."
        rows={4}
        onChange={(value) =>
          updateField("remarks", value)
        }
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <DialogActions
        loading={loading}
        submitLabel="Adjust Stock"
        cancelLabel="Cancel"
        onCancel={onCancel}
      />
    </form>
  );
}