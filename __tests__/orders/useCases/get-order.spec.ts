import { ordersRepository } from '../../../src/infra/repositories/orders-repository';
import { getOrder } from '../../../src/useCases/orders/get-order';

jest.mock('../../../src/infra/repositories/orders-repository');

describe('getOrder', () => {
  it('should return null if the order does not exist', async () => {
    (ordersRepository.getOrder as jest.Mock).mockResolvedValue(null);

    const result = await getOrder({ orderId: '123' });

    expect(result).toBeNull();
  });

  it('should return order data with products if the order exists', async () => {
    const mockOrder = {
      id: '123',
      customerId: '456',
      total: 100,
      shippingPrice: 10,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      OrderItems: [
        { productId: '789', productName: 'Product 1', price: 50, quantity: 2 },
      ],
    };

    (ordersRepository.getOrder as jest.Mock).mockResolvedValue(mockOrder);

    const result = await getOrder({ orderId: '123' });

    expect(result).toEqual({
      id: '123',
      customerId: '456',
      total: 100,
      shippingPrice: 10,
      status: 'PENDING',
      createdAt: mockOrder.createdAt,
      updatedAt: mockOrder.updatedAt,
      products: [
        { productId: '789', productName: 'Product 1', price: 50, quantity: 2 },
      ],
    });
  });

  it('should return order data with products and handle missing order items', async () => {
    const mockOrder = {
      id: '123',
      customerId: '456',
      total: 100,
      shippingPrice: 10,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      OrderItems: [],
    };

    (ordersRepository.getOrder as jest.Mock).mockResolvedValue(mockOrder);

    const result = await getOrder({ orderId: '123' });

    expect(result).toEqual({
      id: '123',
      customerId: '456',
      total: 100,
      shippingPrice: 10,
      status: 'PENDING',
      createdAt: mockOrder.createdAt,
      updatedAt: mockOrder.updatedAt,
      products: [],
    });
  });
});
