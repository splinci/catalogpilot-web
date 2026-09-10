"use client";

import { useMemo, useState } from "react";

import { BrandHeader } from "./BrandHeader";
import { BrandStats } from "./BrandStats";
import { BrandDialog } from "./BrandDialog";
import { BrandTable } from "./BrandTable";

import { useBrands } from "../hooks/useBrands";

import type { Brand } from "@/domains/brand/types/brand";
import { BrandSearch } from "./BrandSearch";

export function BrandPage() {
  const {
    brands,
    deleteBrand,
  } = useBrands();

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] =
    useState<Brand>();

  const filteredBrands = useMemo(() => {
    const keyword = search.toLowerCase();

    return brands.filter((brand) => {
      return (
        brand.name.toLowerCase().includes(keyword) ||
        brand.code.toLowerCase().includes(keyword) ||
        (brand.description ?? "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [brands, search]);

  return (
    <>
      
        <BrandHeader
          onAddBrand={() => {
            setSelectedBrand(undefined);
            setOpen(true);
          }}
        />
  
        <BrandStats />
  
        <BrandSearch
          value={search}
          onChange={setSearch}
        />
  
        <BrandTable
          brands={filteredBrands}
          onEdit={(brand) => {
            setSelectedBrand(brand);
            setOpen(true);
          }}
          onDelete={async (brand) => {
            const confirmed = window.confirm(
              `Delete "${brand.name}"?\n\nThis action cannot be undone.`
            );
  
            if (!confirmed) {
              return;
            }
  
            await deleteBrand(brand.id);
          }}
        />
      
  
      <BrandDialog
        open={open}
        brand={selectedBrand}
        onClose={() => {
          setOpen(false);
          setSelectedBrand(undefined);
        }}
      />
    </>
  );
}