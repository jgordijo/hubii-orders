import { ordersRepository } from '../../infra/repositories/orders-repository';
import type { getOrderParams } from '../../types/order-types';

export async function getOrder({ orderId }: getOrderParams) {
  const order = await ordersRepository.getOrder({ orderId });

  if (!order) {
    return null;
  }

  const products = order.OrderItems;

  const { OrderItems, ...rest } = order;

  return {
    ...rest,
    products,
  };
}
