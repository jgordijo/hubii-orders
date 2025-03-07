import { getCustomerShippingRoute } from '../../../src/routes/customers/get-customer-shipping-route';
import { getCustomerShipping } from '../../../src/useCases/customers/calculate-customer-shipping';
import { setupTestServer } from '../../mocks/setupTestServer';

jest.mock('../../../src/useCases/customers/calculate-customer-shipping');

describe('GET /customers/:customerId/shipping', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(getCustomerShippingRoute);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and the shipping info for the customer', async () => {
    const mockShippingInfo = {
      customerId: 'b21d0838-9d7c-4ba5-b63d-c8e8bc99eb38',
      zipCode: '12345678',
      pac: '15.50',
      sedex: '20.75',
      dotPackage: '10.00',
      dotCom: '12.00',
      expresso: '25.00',
    };

    (getCustomerShipping as jest.Mock).mockResolvedValue(mockShippingInfo);

    const response = await app.inject({
      method: 'GET',
      url: '/customers/b21d0838-9d7c-4ba5-b63d-c8e8bc99eb38/shipping',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual({
      shippingInfo: mockShippingInfo,
    });
  });

  it('should return 400 if the customerId is invalid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/customers/invalid-customer-id/shipping',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      code: 'FST_ERR_VALIDATION',
      message: 'params/customerId Invalid uuid',
    });
  });
});
