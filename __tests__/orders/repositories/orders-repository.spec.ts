import { OrderStatus, type Orders, Prisma } from '@prisma/client';
import { prisma } from '../../../src/infra/prisma/client';
import { ordersRepository } from '../../../src/infra/repositories/orders-repository';

jest.mock('../../../src/infra/prisma/client', () => {
  return {
    prisma: {
      orders: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

beforeAll(() => {
  jest.useFakeTimers({ advanceTimers: true }).setSystemTime(new Date());
});

afterAll(() => {
  jest.useRealTimers();
});

describe('ordersRepository', () => {
  describe('createOrder', () => {
    it('should successfully create an order', async () => {
      const order = {
        customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
        total: 474.98,
        shippingPrice: '20',
        items: [
          {
            productId: 'fake-id',
            quantity: 10,
            price: '45.98',
            productName: 'Item 1',
          },
        ],
      };

      const expectedOrder = {
        id: '4cc4b6e4-2905-45ed-a9d6-8295a3bcabac',
        customerId: order.customerId,
        status: OrderStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
        total: new Prisma.Decimal('474.98'),
        shippingPrice: new Prisma.Decimal('20'),
      };

      (prisma.orders.create as jest.Mock).mockResolvedValueOnce(expectedOrder);

      const result = await ordersRepository.createOrder(order);

      expect(result).toStrictEqual(expectedOrder);

      expect(prisma.orders.create).toHaveBeenCalledWith({
        data: {
          customer: {
            connect: {
              id: order.customerId,
            },
          },
          OrderItems: {
            createMany: {
              data: order.items,
            },
          },
          shippingPrice: order.shippingPrice,
          status: OrderStatus.PENDING,
          total: order.total,
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

      expect(prisma.orders.create).toHaveBeenCalledTimes(1);
    });
  });
  describe('updateOrder', () => {
    it('should successfully get a customer by id', async () => {
      const orderId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

      const data = {
        status: OrderStatus.CONFIRMED,
      };

      const order = {
        id: '4cc4b6e4-2905-45ed-a9d6-8295a3bcabac',
        customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
        total: new Prisma.Decimal('474.98'),
        shippingPrice: new Prisma.Decimal('20'),
        status: OrderStatus.CONFIRMED,
        createdAt: new Date('2025-03-06T15:43:13.721Z'),
        updatedAt: new Date('2025-03-06T15:43:13.752Z'),
      };

      (prisma.orders.update as jest.Mock).mockResolvedValueOnce(
        order as Orders
      );

      await ordersRepository.updateOrder({ orderId, data });

      expect(prisma.orders.update).toHaveBeenCalledWith({
        where: {
          id: orderId,
        },
        data,
      });

      expect(prisma.orders.update).toHaveBeenCalledTimes(1);
    });
  });
});
