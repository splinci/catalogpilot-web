"use client";

import { useEffect, useState } from "react";

import { DialogActions } from "@/components/common/DialogActions";
import { TextField } from "@/components/forms/TextField";

import { useSalesChannels } from "../hooks/useSalesChannels";

import type { CreateSalesChannelDto } from "@/domains/sales-channel/dto/create-sales-channel.dto";
import type { SalesChannelModel } from "@/domains/sales-channel/types/sales-channel";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";

interface SalesChannelFormProps {
  channel?: SalesChannelModel;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialForm: CreateSalesChannelDto = {
  name: "",
  code: "",
  type: "MARKETPLACE",
  country: "",
  description: "",
  logoUrl: "",
  websiteUrl: "",
  enabled: true,
};

export function SalesChannelForm({
  channel,
  onSuccess,
  onCancel,
}: SalesChannelFormProps) {
  const {
    createSalesChannel,
    updateSalesChannel,
  } = useSalesChannels();

  const [form, setForm] =
    useState<CreateSalesChannelDto>(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (channel) {
      setForm({
        name: channel.name,
        code: channel.code,
        type: channel.type,
        country: channel.country ?? "",
        description: channel.description ?? "",
        logoUrl: channel.logoUrl ?? "",
        websiteUrl: channel.websiteUrl ?? "",
        enabled: channel.enabled,
      });
    } else {
      setForm(initialForm);
    }
  }, [channel]);

  function updateField<
    K extends keyof CreateSalesChannelDto
  >(
    field: K,
    value: CreateSalesChannelDto[K]
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
      setError("Name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Code is required.");
      return;
    }

    try {
      setLoading(true);

      if (channel) {
        await updateSalesChannel({
          id: channel.id,
          data: form,
        });
      } else {
        await createSalesChannel(form);
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
        id='name'
        label="Name"
        value={form.name}
        onChange={(value) =>
          updateField("name", value)
        }
      />

      <TextField
        id="code"
        label="Code"
        value={form.code}
        onChange={(value) =>
          updateField("code", value)
        }
      />
      <SelectField
  id="type"
  label="Channel Type"
  required
  value={form.type}
  options={[
    {
      value: "MARKETPLACE",
      label: "Marketplace",
    },
    {
      value: "STORE",
      label: "Store",
    },
    {
      value: "SOCIAL",
      label: "Social",
    },
  ]}
  onChange={(value) =>
    updateField(
      "type",
      value as CreateSalesChannelDto["type"]
    )
  }
/>
      <TextField
        id="country"
        label="Country"
        value={form.country ?? ""}
        onChange={(value) =>
          updateField("country", value)
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
      <TextareaField
  id="description"
  label="Description"
  value={form.description ?? ""}
  placeholder="Describe this sales channel..."
  rows={4}
  onChange={(value) =>
    updateField("description", value)
  }
/>
      <DialogActions
        loading={loading}
        onCancel={onCancel}
        submitLabel={
          channel
            ? "Update Sales Channel"
            : "Save Sales Channel"
        }
      />
    </form>
  );
}