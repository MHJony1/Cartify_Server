import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";


export interface IOrderItem {
  productId: string;
  quantity: number;
}

export interface ICreateOrder {
  items: IOrderItem[];
  shippingAddress: string;
  paymentMethod?: PaymentMethod;
}

export interface IUpdateOrder {
  status: OrderStatus;
}

export interface IOrderQuery {
  page?: number;
  limit?: number;

  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}