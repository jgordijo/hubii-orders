import { OrderStatus } from '@prisma/client';
import { customersRepository } from '../../../src/infra/repositories/customers-repository';
import { ordersRepository } from '../../../src/infra/repositories/orders-repository';
import type { createOrderParams } from '../../../src/types/order-types';
import { stockActionEnum } from '../../../src/types/products-type';
import { createOrder } from '../../../src/useCases/orders/create-order';
import { calculateItemsPrice } from '../../../src/utils/calculate-items-price';
import { calculateShipping } from '../../../src/utils/calculate-shipping';
import { productsClient } from '../../../src/utils/products-client';

jest.mock('../../../src/infra/repositories/customers-repository');
jest.mock('../../../src/infra/repositories/orders-repository');
jest.mock('../../../src/utils/products-client');
jest.mock('../../../src/utils/calculate-items-price');
jest.mock('../../../src/utils/calculate-shipping');

describe('createOrder', () => {
  it('should successfully create an order and update stock', async () => {
    const customerId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';
    const items = [
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ];
    const shippingMethod = 'sedex';

    const customer = { id: customerId, name: 'John Doe' };
    const products = [
      { id: 'product-1', price: 50, name: 'Product 1' },
      { id: 'product-2', price: 30, name: 'Product 2' },
    ];
    const orderItems = [
      {
        productId: 'product-1',
        quantity: 2,
        price: 50,
        productName: 'Product 1',
      },
      {
        productId: 'product-2',
        quantity: 1,
        price: 30,
        productName: 'Product 2',
      },
    ];
    const itemsPrice = 130;
    const shippingPrice = '20';
    const total = itemsPrice + Number.parseFloat(shippingPrice);

    const createdOrder = {
      id: 'order-123',
      customerId,
      total,
      shippingPrice,
      status: OrderStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedOrder = { ...createdOrder, status: OrderStatus.CONFIRMED };

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValueOnce(
      customer
    );

    (productsClient.getProducts as jest.Mock).mockResolvedValueOnce({
      products,
    });

    (calculateItemsPrice as jest.Mock).mockReturnValueOnce(itemsPrice);
    (ordersRepository.createOrder as jest.Mock).mockResolvedValueOnce(
      createdOrder
    );

    (calculateShipping as jest.Mock).mockResolvedValueOnce({
      [shippingMethod]: shippingPrice,
    });

    (productsClient.updateStock as jest.Mock).mockResolvedValueOnce({});

    (ordersRepository.updateOrder as jest.Mock).mockResolvedValueOnce(
      updatedOrder
    );

    const result = await createOrder({ customerId, items, shippingMethod });

    expect(result.order).toStrictEqual(updatedOrder);
    expect(customersRepository.getCustomerById).toHaveBeenCalledWith(
      customerId
    );
    expect(productsClient.getProducts).toHaveBeenCalledWith({
      productsIds: ['product-1', 'product-2'],
    });
    expect(calculateItemsPrice).toHaveBeenCalledWith(orderItems);
    expect(calculateShipping).toHaveBeenCalledWith({ customer });
    expect(ordersRepository.createOrder).toHaveBeenCalledWith({
      customerId,
      items: orderItems,
      shippingPrice,
      total,
    });
    expect(productsClient.updateStock).toHaveBeenCalledWith({
      products: [
        {
          productId: 'product-1',
          quantity: 2,
          action: stockActionEnum.SELL,
          description: 'Selling for order order-123',
        },
        {
          productId: 'product-2',
          quantity: 1,
          action: stockActionEnum.SELL,
          description: 'Selling for order order-123',
        },
      ],
    });
    expect(ordersRepository.updateOrder).toHaveBeenCalledWith({
      orderId: createdOrder.id,
      data: { status: OrderStatus.CONFIRMED },
    });
  });
  it('should throw an error if the customer is not found', async () => {
    const customerId = 'invalid-id';
    const items = [
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ];
    const shippingMethod = 'sedex';

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValueOnce(
      null
    );

    await expect(
      createOrder({ customerId, items, shippingMethod })
    ).rejects.toThrow('Customer not found');
  });
  it('should throw an error when failing to get shipping info', async () => {
    const request = {
      customerId: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ],
      shippingMethod: 'sedex',
    } as createOrderParams;

    const customer = {
      id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
      zipCode: '09030310',
    };

    const products = [
      { id: 'product-1', price: 50, name: 'Product 1' },
      { id: 'product-2', price: 30, name: 'Product 2' },
    ];

    const orderItems = [
      {
        productId: 'product-1',
        quantity: 2,
        price: 50,
        productName: 'Product 1',
      },
      {
        productId: 'product-2',
        quantity: 1,
        price: 30,
        productName: 'Product 2',
      },
    ];

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValueOnce(
      customer
    );

    (productsClient.getProducts as jest.Mock).mockResolvedValueOnce({
      products,
    });

    (calculateShipping as jest.Mock).mockResolvedValueOnce({
      pac: 'Not available',
      sedex: null,
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 'Not available',
      customerId: customer.id,
      zipCode: customer.zipCode,
    });

    await expect(createOrder(request)).rejects.toThrow(
      'Shipping method invalid for this customer location'
    );

    expect(customersRepository.getCustomerById).toHaveBeenCalledWith(
      request.customerId
    );
    expect(productsClient.getProducts).toHaveBeenCalledWith({
      productsIds: ['product-1', 'product-2'],
    });
    expect(calculateItemsPrice).toHaveBeenCalledWith(orderItems);
    expect(calculateShipping).toHaveBeenCalledWith({ customer });
    expect(ordersRepository.createOrder).not.toHaveBeenCalled();
    expect(productsClient.updateStock).not.toHaveBeenCalled();
    expect(ordersRepository.updateOrder).not.toHaveBeenCalled();
  });
});
