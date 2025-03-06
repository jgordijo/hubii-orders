import type { Customers } from '@prisma/client';
import { prisma } from '../../../src/infra/prisma/client';
import { customersRepository } from '../../../src/infra/repositories/customers-repository';

jest.mock('../../../src/infra/prisma/client', () => {
  return {
    prisma: {
      customers: {
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

describe('customersRepository', () => {
  describe('getCustomers', () => {
    it('should successfully get customers list', async () => {
      const list = [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await customersRepository.getCustomers({
        page: 1,
        pageSize: 5,
      });

      expect(result).toStrictEqual({ customers: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.customers.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            zipCode: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {},
          take: 5,
          skip: 0,
        }),
        prisma.customers.count({
          where: {},
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get customers list and filter by name', async () => {
      const name = 'John';

      const list = [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await customersRepository.getCustomers({
        page: 1,
        pageSize: 5,
        name,
      });

      expect(result).toStrictEqual({ customers: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.customers.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            zipCode: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            name: { contains: name, mode: 'insensitive' },
          },
          take: 5,
          skip: 0,
        }),
        prisma.customers.count({
          where: {
            name: { contains: name, mode: 'insensitive' },
          },
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get customers list and filter by email', async () => {
      const email = 'john.doe@gmail.com';

      const list = [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await customersRepository.getCustomers({
        page: 1,
        pageSize: 5,
        email,
      });

      expect(result).toStrictEqual({ customers: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.customers.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            zipCode: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            email: { contains: email, mode: 'insensitive' },
          },
          take: 5,
          skip: 0,
        }),
        prisma.customers.count({
          where: {
            email: { contains: email, mode: 'insensitive' },
          },
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
    it('should successfully get customers list with default pagination params', async () => {
      const list = [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const countResult = 1;

      (prisma.$transaction as jest.Mock).mockResolvedValueOnce([
        list,
        countResult,
      ]);

      const result = await customersRepository.getCustomers({});

      expect(result).toStrictEqual({ customers: list, count: countResult });

      expect(prisma.$transaction).toHaveBeenCalledWith([
        prisma.customers.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            zipCode: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {},
          take: 5,
          skip: 0,
        }),
        prisma.customers.count({
          where: {},
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
  describe('getCustiberById', () => {
    it('should successfully get a customer by id', async () => {
      const customerId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

      const customer = {
        id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        zipCode: '20000000',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.customers.findUnique as jest.Mock).mockResolvedValueOnce(
        customer as Customers
      );

      await customersRepository.getCustomerById(customerId);

      expect(prisma.customers.findUnique).toHaveBeenCalledWith({
        where: {
          id: customerId,
        },
      });

      expect(prisma.customers.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
