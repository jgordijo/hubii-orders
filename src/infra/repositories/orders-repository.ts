import { OrderStatus } from '@prisma/client';
import type {
  createOrderRepositoryParams,
  updateOrderParams,
} from '../../types/order-types';
import { prisma } from '../prisma/client';

export const ordersRepository = {
  createOrder: async ({
    customerId,
    items,
    shippingPrice,
    total,
  }: createOrderRepositoryParams) => {
    return prisma.orders.create({
      data: {
        customer: {
          connect: {
            id: customerId,
          },
        },
        OrderItems: {
          createMany: {
            data: items,
          },
        },
        shippingPrice,
        status: OrderStatus.PENDING,
        total,
      },
      select: {
        id: true,
        customerId: true,
        total: true,
        shippingPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
  updateOrder: async ({ orderId, data }: updateOrderParams) => {
    return prisma.orders.update({
      where: {
        id: orderId,
      },
      data,
    });
  },
};
