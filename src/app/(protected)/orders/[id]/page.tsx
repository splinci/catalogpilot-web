"use client";

import { useParams } from "next/navigation";

import { useOrder } from "@/domains/order/hooks/useOrder";
import OrderDetails from "@/domains/order/components/OrderDetails";

export default function OrderDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const {
    data: order,
    isLoading,
    error,
  } = useOrder(id);

  if (isLoading) {
    return (
      
        <p>Loading order...</p>
      
    );
  }

  if (error || !order) {
    return (
      
        <p>Order not found.</p>
      
    );
  }

  return (
    
      <OrderDetails order={order} />
    
  );
}