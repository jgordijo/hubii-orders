import type {
  getCustomersFilterParams,
  getCustomersParams,
} from '../../types/customers-types';
import { prisma } from '../prisma/client';

export const customersRepository = {
  getCustomers: async ({
    name,
    page = 1,
    pageSize = 10,
    email,
  }: getCustomersParams) => {
    const filter: getCustomersFilterParams = {
      name: undefined,
      email: undefined,
    };

    if (name) {
      filter.name = { contains: name, mode: 'insensitive' };
    }

    if (email) {
      filter.email = { contains: email, mode: 'insensitive' };
    }

    const [customers, count] = await prisma.$transaction([
      prisma.customers.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          zipCode: true,
          createdAt: true,
          updatedAt: true,
        },
        where: filter,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
      prisma.customers.count({ where: filter }),
    ]);

    return { customers, count };
  },
};
