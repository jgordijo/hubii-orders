import type { OrderStatus, Orders } from '@prisma/client';

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
  shippingMethod: 'pac' | 'sedex' | 'dotPackage' | 'dotCom' | 'expresso';
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

export interface getOrderParams {
  orderId: string;
}

export interface getOrdersParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  customerId?: string;
}

export interface getOrdersFilterParams {
  customerId?: string;
  status?: OrderStatus;
}
