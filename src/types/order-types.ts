import type { Orders } from '@prisma/client';

export interface createOrderRepositoryParams {
  customerId: string;
  shippingPrice: string;
  total: number;
  items: {
    productId: string;
    quantity: number;
    productName: string;
    price: string;
  }[];
}

export interface createOrderParams {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface orderItems {
  items: {
    quantity: number;
    price: string;
  }[];
}

export interface updateOrderParams {
  orderId: string;
  data: Partial<Orders>;
}
