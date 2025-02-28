import { helloWorldRoute } from '../src/routes/hello-world-route';
import { setupTestServer } from './mocks/setupTestServer';

describe('helloWorldRoute', () => {
  let app: Awaited<ReturnType<typeof setupTestServer>>;

  beforeAll(async () => {
    app = await setupTestServer();
    await app.register(helloWorldRoute);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return a Hello World message', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Hello, Hubii!' });
  });
});
