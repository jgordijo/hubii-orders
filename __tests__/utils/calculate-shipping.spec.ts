import type { Customers } from '@prisma/client';
import { shippingCache } from '../../src/utils/cache';
import { calculateShipping } from '../../src/utils/calculate-shipping';
import { melhorEnvioClient } from '../../src/utils/melhor-envio-client';

jest.mock('../../src/utils/melhor-envio-client');
jest.mock('../../src/utils/cache');

describe('calculateShipping', () => {
  const customer = {
    id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    zipCode: '20000000',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Customers;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return shipping info from cache if available and zipCode matches', async () => {
    const mockShippingInfo = {
      customerId: customer.id,
      zipCode: customer.zipCode,
      pac: 15.99,
      sedex: 25.5,
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 35.0,
    };

    (shippingCache.has as jest.Mock).mockReturnValue(true);
    (shippingCache.get as jest.Mock).mockReturnValue(mockShippingInfo);

    const shippingInfo = await calculateShipping({ customer });

    expect(shippingInfo).toEqual(mockShippingInfo);
    expect(shippingCache.has).toHaveBeenCalledWith(customer.id);
    expect(shippingCache.get).toHaveBeenCalledWith(customer.id);
  });

  it('should fetch and cache shipping info if not available in cache', async () => {
    const mockShippingRates = [
      { price: 15.99 },
      { price: 25.5 },
      { price: 'Not available' },
      { price: 'Not available' },
      { price: 35.0 },
    ];

    const mockShippingInfo = {
      customerId: customer.id,
      zipCode: customer.zipCode,
      pac: 15.99,
      sedex: 25.5,
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 35.0,
    };

    (shippingCache.has as jest.Mock).mockReturnValue(false);
    (melhorEnvioClient.getShippingRate as jest.Mock).mockResolvedValueOnce(
      mockShippingRates
    );
    (shippingCache.set as jest.Mock).mockImplementation(() => {});

    const shippingInfo = await calculateShipping({ customer });

    expect(shippingInfo).toEqual(mockShippingInfo);
    expect(shippingCache.has).toHaveBeenCalledWith(customer.id);
    expect(melhorEnvioClient.getShippingRate).toHaveBeenCalledWith({
      customerZipCode: customer.zipCode,
    });
    expect(shippingCache.set).toHaveBeenCalledWith(
      customer.id,
      mockShippingInfo
    );
  });

  it('should return "Not available" for all services if shipping calculation fails', async () => {
    const mockError = new Error('API request failed');
    (shippingCache.has as jest.Mock).mockReturnValue(false);
    (melhorEnvioClient.getShippingRate as jest.Mock).mockRejectedValue(
      mockError
    );

    const shippingInfo = await calculateShipping({ customer });

    expect(shippingInfo).toEqual({
      customerId: customer.id,
      zipCode: customer.zipCode,
      pac: 'Not available',
      sedex: 'Not available',
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 'Not available',
    });
    expect(shippingCache.has).toHaveBeenCalledWith(customer.id);
    expect(melhorEnvioClient.getShippingRate).toHaveBeenCalledWith({
      customerZipCode: customer.zipCode,
    });
    expect(console.error).toHaveBeenCalledWith(
      'Failed to calculate shipping price: API request failed'
    );
  });
  it('should return "Not available" for all services if shipping rate is incomplete', async () => {
    const mockShippingRates = [
      { price: 15.99 },
      { price: null },
      { price: null },
      { price: null },
      { price: 35.0 },
    ];

    const mockShippingInfo = {
      customerId: customer.id,
      zipCode: customer.zipCode,
      pac: 15.99,
      sedex: 'Not available',
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 35.0,
    };

    (shippingCache.has as jest.Mock).mockReturnValue(false);
    (melhorEnvioClient.getShippingRate as jest.Mock).mockResolvedValueOnce(
      mockShippingRates
    );
    (shippingCache.set as jest.Mock).mockImplementation(() => {});

    const shippingInfo = await calculateShipping({ customer });

    expect(shippingInfo).toEqual(mockShippingInfo);
    expect(shippingCache.has).toHaveBeenCalledWith(customer.id);
    expect(melhorEnvioClient.getShippingRate).toHaveBeenCalledWith({
      customerZipCode: customer.zipCode,
    });
    expect(shippingCache.set).toHaveBeenCalledWith(
      customer.id,
      mockShippingInfo
    );
  });
  it('should log a generic error message when an unknown error is thrown', async () => {
    (shippingCache.has as jest.Mock).mockReturnValue(false);
    (melhorEnvioClient.getShippingRate as jest.Mock).mockRejectedValue(
      'Unexpected error'
    );

    const shippingInfo = await calculateShipping({ customer });

    expect(shippingInfo).toEqual({
      customerId: customer.id,
      zipCode: customer.zipCode,
      pac: 'Not available',
      sedex: 'Not available',
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 'Not available',
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to calculate shipping price: Unexpected error'
    );
  });
});
