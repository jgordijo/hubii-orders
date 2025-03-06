import { ordersRepository } from '../../infra/repositories/orders-repository';
import type { getOrdersParams } from '../../types/order-types';

export async function getOrders({
  page = 1,
  pageSize = 10,
  status,
  customerId,
}: getOrdersParams) {
  const { orders, count } = await ordersRepository.getOrders({
    page,
    pageSize,
    customerId,
    status,
  });

  return {
    list: orders,
    meta: {
      currentPage: page,
      total: count,
      lastPage: Math.ceil(count / pageSize),
    },
  };
}
