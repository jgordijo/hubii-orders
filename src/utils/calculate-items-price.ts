import type { orderItems } from '../types/order-types';

export const calculateItemsPrice = (
  orderItems: orderItems['items']
): number => {
  return orderItems.reduce(
    (total, item) => total + item.quantity * Number.parseFloat(item.price),
    0
  );
};
