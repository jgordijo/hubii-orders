import { OrderStatus } from '@prisma/client';
import type {
  createOrderRepositoryParams,
  getOrderParams,
  getOrdersFilterParams,
  getOrdersParams,
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
  getOrder: async ({ orderId }: getOrderParams) => {
    return prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        customerId: true,
        total: true,
        shippingPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        OrderItems: {
          select: {
            productId: true,
            productName: true,
            price: true,
            quantity: true,
          },
        },
      },
    });
  },
  getOrders: async ({
    status,
    page = 1,
    pageSize = 10,
    customerId,
  }: getOrdersParams) => {
    const filter: getOrdersFilterParams = {
      customerId: undefined,
      status: undefined,
    };

    if (customerId) {
      filter.customerId = customerId;
    }

    if (status) {
      filter.status = status;
    }

    const [orders, count] = await prisma.$transaction([
      prisma.orders.findMany({
        select: {
          id: true,
          customerId: true,
          total: true,
          shippingPrice: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        where: filter,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.orders.count({ where: filter }),
    ]);

    return { orders, count };
  },
};
