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
    it('should successfully update an order', async () => {
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
  describe('getOrder', () => {
    it('should successfully retrieve an order', async () => {
      const orderId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

      const order = {
        id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        zipCode: '20000000',
        createdAt: new Date(),
        updatedAt: new Date(),
        OrderItems: [
          {
            productId: '3b43a917-3f15-46d3-83d7-6ac2d9c11250',
            productName: 'Ração Canina Adulto 7.5kg',
            price: '439.99',
            quantity: 1,
          },
          {
            productId: '4b756380-8d67-4e9d-981d-ac0d439960a7',
            productName: 'Sorvete Cone',
            price: '14.99',
            quantity: 1,
          },
        ],
      };

      (prisma.orders.findUnique as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersRepository.getOrder({ orderId });

      expect(result).toStrictEqual(order);

      expect(prisma.orders.findUnique).toHaveBeenCalledWith({
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

      expect(prisma.orders.findUnique).toHaveBeenCalledTimes(1);
    });
  });
  describe('getOrders', () => {
    it('should successfully get orders list', async () => {
      const list = [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await ordersRepository.getOrders({
        page: 1,
        pageSize: 5,
      });

      expect(result).toStrictEqual({ orders: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
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
          where: {},
          take: 5,
          skip: 1,
        }),
        prisma.orders.count({ where: {} }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get orders list and filter by customerId', async () => {
      const customerId = '05b18a89-857f-41ec-8905-12d44378b85f';

      const list = [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await ordersRepository.getOrders({
        page: 1,
        pageSize: 5,
        customerId,
      });

      expect(result).toStrictEqual({ orders: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
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
          where: { customerId },
          take: 5,
          skip: 1,
        }),
        prisma.orders.count({ where: { customerId } }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get orders list and filter by status', async () => {
      const status = OrderStatus.CONFIRMED;

      const list = [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await ordersRepository.getOrders({
        page: 1,
        pageSize: 5,
        status,
      });

      expect(result).toStrictEqual({ orders: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
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
          where: { status },
          take: 5,
          skip: 1,
        }),
        prisma.orders.count({ where: { status } }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get orders list with default pagination params', async () => {
      const list = [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await ordersRepository.getOrders({});

      expect(result).toStrictEqual({ orders: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
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
          where: {},
          take: 5,
          skip: 1,
        }),
        prisma.orders.count({ where: {} }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
