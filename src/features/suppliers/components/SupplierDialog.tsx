"use client";

import { useEffect, useState } from "react";

import type { Supplier } from "@/domains/supplier/types/supplier";

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

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
}: SupplierDialogProps) {
  const {
    createSupplier,
    updateSupplier,
    creating,
    updating,
  } = useSuppliers();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (supplier) {
      setCode(supplier.code);
      setName(supplier.name);
      setContactPerson(supplier.contactPerson ?? "");
      setEmail(supplier.email ?? "");
      setPhone(supplier.phone ?? "");
      setAddress(supplier.address ?? "");
    } else {
      setCode("");
      setName("");
      setContactPerson("");
      setEmail("");
      setPhone("");
      setAddress("");
    }
  }, [supplier, open]);

  async function handleSubmit() {
    const payload = supplier
  ? {
      id: supplier.id,
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
    }
  : {
      code,
      name,
      contactPerson,
      email,
      phone,
      address,
    };

    if (supplier) {
      await updateSupplier({
        id: supplier.id,
        data: {
          id: supplier.id,
          code,
          name,
          contactPerson,
          email,
          phone,
          address,
        },
      });
    } else {
      await createSupplier({
        code,
        name,
        contactPerson,
        email,
        phone,
        address,
      });
    }
    
    onOpenChange(false);
  }

  const loading = creating || updating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>

            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="name">Name</Label>

            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
          <Label htmlFor="contactPerson">Contact Person</Label>

<Input
  id="contactPerson"
  value={contactPerson}
  onChange={(e) => setContactPerson(e.target.value)}
/>

<Label htmlFor="email">Email</Label>

<Input
  id="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

<Label htmlFor="phone">Phone</Label>

<Input
  id="phone"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
/>

<Label htmlFor="address">Address</Label>

<Input
  id="address"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {supplier ? "Save Changes" : "Create Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}