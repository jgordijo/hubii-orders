import { customersRepository } from '../../../src/infra/repositories/customers-repository';
import { getCustomerShipping } from '../../../src/useCases/customers/calculate-customer-shipping';
import { calculateShipping } from '../../../src/utils/calculate-shipping';

jest.mock('../../../src/infra/repositories/customers-repository');
jest.mock('../../../src/utils/calculate-shipping');

describe('getCustomerShipping', () => {
  it('should return shipping information for a valid customer', async () => {
    const customerId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

    const mockCustomer = {
      id: customerId,
      name: 'John Doe',
      zipCode: '09030310',
    };

    const mockShippingInfo = {
      customerId,
      zipCode: '09030310',
      pac: 15.99,
      sedex: 25.5,
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 35.0,
    };

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValue(
      mockCustomer
    );
    (calculateShipping as jest.Mock).mockResolvedValue(mockShippingInfo);

    const shippingInfo = await getCustomerShipping({ customerId });

    expect(shippingInfo).toEqual(mockShippingInfo);
    expect(customersRepository.getCustomerById).toHaveBeenCalledWith(
      customerId
    );
    expect(calculateShipping).toHaveBeenCalledWith({ customer: mockCustomer });
  });

  it('should throw an error if the customer is not found', async () => {
    const customerId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValue(null);

    await expect(getCustomerShipping({ customerId })).rejects.toThrow(
      'Customer not found'
    );
    expect(customersRepository.getCustomerById).toHaveBeenCalledWith(
      customerId
    );
    expect(calculateShipping).not.toHaveBeenCalled();
  });

  it('should throw an error if there is an issue calculating shipping', async () => {
    const customerId = '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc';

    const mockCustomer = {
      id: customerId,
      name: 'John Doe',
      address: '123 Main St',
      zipCode: '09030310',
    };

    (customersRepository.getCustomerById as jest.Mock).mockResolvedValue(
      mockCustomer
    );
    (calculateShipping as jest.Mock).mockRejectedValue(
      new Error('Shipping calculation failed')
    );

    await expect(getCustomerShipping({ customerId })).rejects.toThrow(
      'Shipping calculation failed'
    );
    expect(customersRepository.getCustomerById).toHaveBeenCalledWith(
      customerId
    );
    expect(calculateShipping).toHaveBeenCalledWith({ customer: mockCustomer });
  });
});
