import { OrderStatus } from '@prisma/client';
import { customersRepository } from '../../infra/repositories/customers-repository';
import { ordersRepository } from '../../infra/repositories/orders-repository';
import type { createOrderParams } from '../../types/order-types';
import {
  stockActionEnum,
  type updateProductStockBody,
} from '../../types/products-type';
import { calculateItemsPrice } from '../../utils/calculate-items-price';
import { calculateShipping } from '../../utils/calculate-shipping';
import { productsClient } from '../../utils/products-client';

export async function createOrder({
  customerId,
  items,
  shippingMethod,
}: createOrderParams) {
  const customer = await customersRepository.getCustomerById(customerId);

  if (!customer) throw new Error('Customer not found');

  const { products } = await productsClient.getProducts({
    productsIds: items.map(item => item.productId),
  });

  const orderItems = products.map(product => ({
    productId: product.id,
    // biome-ignore lint/style/noNonNullAssertion:
    quantity: items.find(item => item.productId === product.id)?.quantity!,
    price: product.price,
    productName: product.name,
  }));

  const itemsPrice = calculateItemsPrice(orderItems);

  const shippingInfo = await calculateShipping({ customer });

  const shippingPrice = String(
    Number.parseFloat(String(shippingInfo[shippingMethod]))
  );

  if (!shippingPrice || Number.isNaN(Number(shippingPrice))) {
    throw new Error('Shipping method invalid for this customer location');
  }

  const total = Number.parseFloat(shippingPrice) + itemsPrice;

  const createdOrder = await ordersRepository.createOrder({
    customerId,
    items: orderItems,
    shippingPrice,
    total,
  });

  const updateStockBody: updateProductStockBody = {
    products: items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      action: stockActionEnum.SELL,
      description: `Selling for order ${createdOrder.id}`,
    })),
  };

  await productsClient.updateStock({ products: updateStockBody.products });

  const order = await ordersRepository.updateOrder({
    orderId: createdOrder.id,
    data: {
      status: OrderStatus.CONFIRMED,
    },
  });

  return { order };
}
