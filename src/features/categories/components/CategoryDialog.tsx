"use client";

import { useEffect, useState } from "react";

import type { Category } from "@/domains/category/types/category";

import { useCategories } from "@/hooks/useCategories";

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

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const {
    createCategory,
    updateCategory,
    creating,
    updating,
  } = useCategories();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (category) {
      setCode(category.code);
      setName(category.name);
      setDescription(category.description ?? "");
    } else {
      setCode("");
      setName("");
      setDescription("");
    }
  }, [category, open]);

  async function handleSubmit() {
    const payload = category
  ? {
      id: category.id,
      code,
      name,
      description,
    }
  : {
      code,
      name,
      description,
    };

    if (category) {
      await updateCategory({
        id: category.id,
        data: {
          id: category.id,
          code,
          name,
          description,
        },
      });
    } else {
      await createCategory({
        code,
        name,
        description,
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
            {category ? "Edit Category" : "Add Category"}
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
            <Label htmlFor="description">
              Description
            </Label>

            <Input
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
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
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}