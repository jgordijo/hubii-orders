import { getCustomersRoute } from '../../../src/routes/customers/get-customers-route';
import { getCustomers } from '../../../src/useCases/customers/get-customers';
import { setupTestServer } from '../../mocks/setupTestServer';

jest.mock('../../../src/useCases/customers/get-customers');

describe('GET /customers/', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(getCustomersRoute);
    await app.ready();

    const now = new Date('2025-02-28T00:01:00.000Z');

    jest.useFakeTimers({ advanceTimers: true }).setSystemTime(now);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should successfully retrieve customers list and return 200', async () => {
    const listDbResponse = [
      {
        id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        zipCode: '20000000',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const listApiResponse = [
      {
        id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        zipCode: '20000000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const meta = {
      currentPage: 1,
      lastPage: 1,
      total: 1,
    };

    (getCustomers as jest.Mock).mockResolvedValue({
      list: listDbResponse,
      meta,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/customers',
    });

    expect(response.json()).toStrictEqual({
      list: listApiResponse,
      meta,
    });

    expect(response.statusCode).toBe(200);
  });
});
