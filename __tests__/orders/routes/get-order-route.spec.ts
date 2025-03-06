import { Prisma } from '@prisma/client';
import { getOrderRoute } from '../../../src/routes/orders/get-order-route';
import { getOrder } from '../../../src/useCases/orders/get-order';
import { setupTestServer } from '../../mocks/setupTestServer';

jest.mock('../../../src/useCases/orders/get-order');

describe('GET /orders/:orderId', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(getOrderRoute);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });
  it('should return 200 and the order details if the order exists', async () => {
    const mockOrder = {
      id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
      customerId: 'b21d0838-9d7c-4ba5-b63d-c8e8bc99eb38',
      total: new Prisma.Decimal(100.5),
      shippingPrice: new Prisma.Decimal(10.5),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: [
        {
          productId: '42b1cce9-e2e7-48ec-a045-c8c6b8637b63',
          productName: 'Product 1',
          price: new Prisma.Decimal(50),
          quantity: 2,
        },
      ],
    };

    (getOrder as jest.Mock).mockResolvedValue(mockOrder);

    const response = await app.inject({
      method: 'GET',
      url: '/orders/2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      order: {
        ...mockOrder,
        shippingPrice: mockOrder.shippingPrice.toString(),
        products: [
          {
            ...mockOrder.products[0],
            price: mockOrder.products[0].price.toString(),
          },
        ],
        total: mockOrder.total.toString(),
      },
    });
  });
  it('should return 404 if the order does not exist', async () => {
    (getOrder as jest.Mock).mockResolvedValue(null);

    const response = await app.inject({
      method: 'GET',
      url: '/orders/2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('statusCode', 404);
    expect(response.json()).toHaveProperty('code', 'NOT_FOUND');
    expect(response.json()).toHaveProperty(
      'message',
      'Order 2a0e2527-2f90-4b9d-9d71-3b9e12f074dc not found'
    );
  });
});
