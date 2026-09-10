"use client";

import { useState } from "react";
import { TextField } from "@/components/forms/TextField";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/ui/Button";

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  status?: string;
  password?: string;
}

interface UserFormProps {
  initialValues?: UserFormValues;
  roles: {
    id: string;
    name: string;
  }[];
  isEdit?: boolean;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: UserFormValues) => void;
}

export function UserForm({
  initialValues,
  roles,
  isEdit = false,
  submitLabel = "Save",
  submitting = false,
  onSubmit,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(
    initialValues ?? {
      firstName: "",
      lastName: "",
      email: "",
      roleId: "",
      status: "ACTIVE",
      password: "",
    }
  );

  function update<K extends keyof UserFormValues>(
    key: K,
    value: UserFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <TextField
          id="firstName"
          label="First Name"
          value={values.firstName}
          required
          onChange={(value) => update("firstName", value)}
        />

        <TextField
          id="lastName"
          label="Last Name"
          value={values.lastName}
          required
          onChange={(value) => update("lastName", value)}
        />
      </div>

      <TextField
        id="email"
        label="Work Email Address"
        value={values.email}
        required
        onChange={(value) => update("email", value)}
      />

      <TextField
        id="password"
        label={isEdit ? "Reset Password (leave blank to keep current)" : "Set Account Password (optional)"}
        value={values.password || ""}
        onChange={(value) => update("password", value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          id="role"
          label="Assigned Role"
          value={values.roleId}
          required
          options={roles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
          onChange={(value) => update("roleId", value)}
        />

        <SelectField
          id="status"
          label="Account Status"
          value={values.status || "ACTIVE"}
          required
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          onChange={(value) => update("status", value)}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}