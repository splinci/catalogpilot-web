"use client";

import { useEffect, useState } from "react";

import { DialogActions } from "@/components/common/DialogActions";
import { TextField } from "@/components/forms/TextField";
import { TextareaField } from "@/components/forms/TextareaField";

import { useBrands } from "../hooks/useBrands";

import type { CreateBrandDto } from "@/domains/brand/dto/create-brand.dto";
import type { Brand } from "@/domains/brand/types/brand";

interface BrandFormProps {
  brand?: Brand;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialForm: CreateBrandDto = {
  name: "",
  code: "",
  description: "",
  websiteUrl: "",
  logoUrl: "",
  enabled: true,
};

export function BrandForm({
  brand,
  onSuccess,
  onCancel,
}: BrandFormProps) {
  const {
    createBrand,
    updateBrand,
  } = useBrands();

  const [form, setForm] =
    useState<CreateBrandDto>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        code: brand.code,
        description: brand.description ?? "",
        websiteUrl: brand.websiteUrl ?? "",
        logoUrl: brand.logoUrl ?? "",
        enabled: brand.enabled,
      });
    } else {
      setForm(initialForm);
    }
  }, [brand]);

  function updateField<
    K extends keyof CreateBrandDto
  >(
    field: K,
    value: CreateBrandDto[K]
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

    if (!form.name.trim()) {
      setError("Brand name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Brand code is required.");
      return;
    }

    try {
      setLoading(true);

      if (brand) {
        await updateBrand({
          id: brand.id,
          data: form,
        });
      } else {
        await createBrand(form);
      }

      onSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <TextField
        id="name"
        label="Brand Name"
        required
        value={form.name}
        onChange={(value) =>
          updateField("name", value)
        }
      />

      <TextField
        id="code"
        label="Code"
        required
        value={form.code}
        onChange={(value) =>
          updateField("code", value)
        }
      />

      <TextField
        id="websiteUrl"
        label="Website URL"
        value={form.websiteUrl ?? ""}
        onChange={(value) =>
          updateField("websiteUrl", value)
        }
      />

      <TextField
        id="logoUrl"
        label="Logo URL"
        value={form.logoUrl ?? ""}
        onChange={(value) =>
          updateField("logoUrl", value)
        }
      />

      <TextareaField
        id="description"
        label="Description"
        rows={4}
        placeholder="Describe this brand..."
        value={form.description ?? ""}
        onChange={(value) =>
          updateField("description", value)
        }
      />

      <DialogActions
        loading={loading}
        onCancel={onCancel}
        submitLabel={
          brand
            ? "Update Brand"
            : "Save Brand"
        }
      />
    </form>
  );
}