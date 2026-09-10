"use client";

import { useMemo, useState } from "react";

import { useCallback } from "react";

import type { Product } from "@/domains/product/types/product";
import type { OrderItem } from "../types";

export function useCreateOrder(
  initialItems: OrderItem[] = []
) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);

  const setOrderItems = useCallback(
    (newItems: OrderItem[]) => {
      setItems(newItems);
    },
    []
  );

  function handleAddProduct(product: Product) {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
          unitPrice: Number(product.sellingPrice),
        },
      ];
    });
  }

  function handleQuantityChange(
    productId: string,
    quantity: number
  ) {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.max(1, quantity),
            }
          : item
      )
    );
  }

  function handleRemoveProduct(productId: string) {
    setItems((current) =>
      current.filter(
        (item) => item.product.id !== productId
      )
    );
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + item.quantity * Number(item.unitPrice),
      0
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [items]);

  return {
    items,
    subtotal,
    totalItems,

    setOrderItems,

    handleAddProduct,
    handleQuantityChange,
    handleRemoveProduct,
  };
}