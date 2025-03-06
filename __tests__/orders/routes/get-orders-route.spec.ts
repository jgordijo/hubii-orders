import { OrderStatus, Prisma } from '@prisma/client';
import { getOrdersRoute } from '../../../src/routes/orders/get-orders-route';
import { getOrders } from '../../../src/useCases/orders/get-orders';
import { setupTestServer } from '../../mocks/setupTestServer';

jest.mock('../../../src/useCases/orders/get-orders');

describe('GET /orders', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(getOrdersRoute);
    await app.ready();

    const now = new Date('2025-02-28T00:01:00.000Z');

    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(now);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully retrieve orders list and return 200', async () => {
    const listDbResponse = [
      {
        id: '0b65acba-0184-4d39-bb38-54c1ad112388',
        customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
        total: new Prisma.Decimal('478.48'),
        shippingPrice: new Prisma.Decimal('20'),
        status: OrderStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const listApiResponse = [
      {
        id: '0b65acba-0184-4d39-bb38-54c1ad112388',
        customerId: '05b18a89-857f-41ec-8905-12d44378b85f',
        total: '478.48',
        shippingPrice: '20',
        status: OrderStatus.CONFIRMED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const meta = {
      currentPage: 1,
      lastPage: 1,
      total: 1,
    };

    (getOrders as jest.Mock).mockResolvedValue({
      list: listDbResponse,
      meta,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/orders',
    });

    expect(response.json()).toStrictEqual({
      list: listApiResponse,
      meta,
    });

    expect(response.statusCode).toBe(200);
  });
});
