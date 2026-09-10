"use client";

import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

interface CustomerFormProps {
  name: string;
  company: string;
  email: string;
  phone: string;
  taxNumber: string;

  
  onNameChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onTaxNumberChange: (value: string) => void;
}

export function CustomerForm({
  name,
  company,
  email,
  phone,
  taxNumber,
  onNameChange,
  onCompanyChange,
  onEmailChange,
  onPhoneChange,
  onTaxNumberChange,
}: CustomerFormProps) {
  return (
    <Card title="Customer Information">
      <div className="grid gap-4 md:grid-cols-2">
      

        <Input
          placeholder="Customer Name"
          value={name}
          onChange={(e) =>
            onNameChange(e.target.value)
          }
        />

        <Input
          placeholder="Company"
          value={company}
          onChange={(e) =>
            onCompanyChange(e.target.value)
          }
        />

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            onEmailChange(e.target.value)
          }
        />

        <Input
          placeholder="Phone"
          value={phone}
          onChange={(e) =>
            onPhoneChange(e.target.value)
          }
        />

        <Input
          placeholder="Tax Number"
          value={taxNumber}
          onChange={(e) =>
            onTaxNumberChange(e.target.value)
          }
        />
      </div>
    </Card>
  );
}