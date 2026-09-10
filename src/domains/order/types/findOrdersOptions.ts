import {
    OrderStatus,
    PaymentStatus,
  } from "@/generated/prisma/enums";
  
  export interface FindOrdersOptions {
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  
    page: number;
    pageSize: number;
  }