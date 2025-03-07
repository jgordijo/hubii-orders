import { env } from '../../src/env';
import { melhorEnvioClient } from '../../src/utils/melhor-envio-client';

global.fetch = jest.fn();

describe('melhorEnvioClient.getShippingRate', () => {
  const mockZipCode = '12345678';
  const mockResponse = [
    { id: 1, name: 'PAC', price: 15.0 },
    { id: 2, name: 'SEDEX', price: 25.0 },
    { id: 3, name: '.Package', price: 30.0 },
    { id: 4, name: '.Com', price: 35.0 },
    { id: 5, name: 'Expresso', price: 50.0 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch shipping rates successfully', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await melhorEnvioClient.getShippingRate({
      customerZipCode: mockZipCode,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${env.MELHOR_ENVIO_API_URL}/api/v2/me/shipment/calculate`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${env.MELHOR_ENVIO_ACCESS_TOKEN}`,
          'User-Agent': 'Orders POC (orders@putsbox.com)',
        }),
      })
    );

    expect(result).toEqual(mockResponse);
  });

  it('should throw an error when the API responds with an error', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(
      melhorEnvioClient.getShippingRate({ customerZipCode: mockZipCode })
    ).rejects.toThrow(
      'Error to calculate shipping: 500 - Internal Server Error'
    );
  });

  it('should throw an error when fetch fails (network error)', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    await expect(
      melhorEnvioClient.getShippingRate({ customerZipCode: mockZipCode })
    ).rejects.toThrow('Network failure');
  });
});
