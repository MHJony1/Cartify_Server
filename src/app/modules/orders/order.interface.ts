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