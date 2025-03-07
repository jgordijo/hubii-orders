import { Prisma } from '@prisma/client';
import { createOrderRoute } from '../../../src/routes/orders/create-order-route';
import { createOrder } from '../../../src/useCases/orders/create-order';
import { setupTestServer } from '../../mocks/setupTestServer';

jest.mock('../../../src/useCases/orders/create-order');

describe('POST /orders', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(createOrderRoute);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully create an order and return 200', async () => {
    const createOrderResponse = {
      order: {
        id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
        customerId: 'b21d0838-9d7c-4ba5-b63d-c8e8bc99eb38',
        total: new Prisma.Decimal(100.5),
        shippingPrice: new Prisma.Decimal(10.5),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const requestBody = {
      customerId: 'b21d0838-9d7c-4ba5-b63d-c8e8bc99eb38',
      items: [
        { productId: '42b1cce9-e2e7-48ec-a045-c8c6b8637b63', quantity: 2 },
      ],
      shippingMethod: 'sedex',
    };

    (createOrder as jest.Mock).mockResolvedValue(createOrderResponse);

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      body: requestBody,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      order: {
        ...createOrderResponse.order,
        shippingPrice: createOrderResponse.order.shippingPrice.toString(),
        total: createOrderResponse.order.total.toString(),
      },
    });
  });

  it('should return 400 when request body is invalid', async () => {
    const invalidRequestBody = {
      customerId: 'invalid-uuid',
      items: [{ productId: 'invalid-uuid', quantity: -1 }],
    };

    const response = await app.inject({
      method: 'POST',
      url: '/orders',
      body: invalidRequestBody,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      code: 'FST_ERR_VALIDATION',
      message:
        'body/customerId Invalid uuid, body/shippingMethod Required, body/items/0/productId Invalid uuid, body/items/0/quantity Number must be greater than 0',
    });
  });
});
