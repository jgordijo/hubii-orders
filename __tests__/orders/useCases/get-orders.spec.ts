import { OrderStatus } from '@prisma/client';
import { ordersRepository } from '../../../src/infra/repositories/orders-repository';
import type { getOrdersParams } from '../../../src/types/order-types';
import { getOrders } from '../../../src/useCases/orders/get-orders';

jest.mock('../../../src/infra/repositories/orders-repository');

describe('getOrders', () => {
  it('should successfully get orders list with pagination params', async () => {
    const params: getOrdersParams = {
      page: 1,
      pageSize: 5,
    };

    const repositoryResponse = {
      orders: [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
    };

    const expected = {
      list: repositoryResponse.orders,
      meta: {
        currentPage: 1,
        total: repositoryResponse.count,
        lastPage: 1,
      },
    };

    (ordersRepository.getOrders as jest.Mock).mockResolvedValueOnce(
      repositoryResponse
    );

    const result = await getOrders(params);

    expect(result).toStrictEqual(expected);
    expect(ordersRepository.getOrders).toHaveBeenCalledWith(params);
    expect(ordersRepository.getOrders).toHaveBeenCalledTimes(1);
  });
  it('should successfully get orders list without pagination params', async () => {
    const repositoryResponse = {
      orders: [
        {
          id: '0b65acba-0184-4d39-bb38-54c1ad112388',
          customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
          total: '478.48',
          shippingPrice: '20',
          status: OrderStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
    };

    const expected = {
      list: repositoryResponse.orders,
      meta: {
        currentPage: 1,
        total: repositoryResponse.count,
        lastPage: 1,
      },
    };

    (ordersRepository.getOrders as jest.Mock).mockResolvedValueOnce(
      repositoryResponse
    );

    const result = await getOrders({});

    expect(result).toStrictEqual(expected);
    expect(ordersRepository.getOrders).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: undefined,
    });
    expect(ordersRepository.getOrders).toHaveBeenCalledTimes(1);
  });
});
