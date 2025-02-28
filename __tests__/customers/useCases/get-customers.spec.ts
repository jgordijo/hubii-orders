import { customersRepository } from '../../../src/infra/repositories/customers-repository';
import type { getCustomersParams } from '../../../src/types/customers-types';
import { getCustomers } from '../../../src/useCases/customers/get-customers';

jest.mock('../../../src/infra/repositories/customers-repository');

describe('getCustomers', () => {
  it('should successfully get customers list with pagination params', async () => {
    const params: getCustomersParams = {
      page: 1,
      pageSize: 5,
    };

    const repositoryResponse = {
      customers: [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
    };

    const expected = {
      list: repositoryResponse.customers,
      meta: {
        currentPage: 1,
        total: repositoryResponse.count,
        lastPage: 1,
      },
    };

    (customersRepository.getCustomers as jest.Mock).mockResolvedValueOnce(
      repositoryResponse
    );

    const result = await getCustomers(params);

    expect(result).toStrictEqual(expected);
    expect(customersRepository.getCustomers).toHaveBeenCalledWith(params);
    expect(customersRepository.getCustomers).toHaveBeenCalledTimes(1);
  });
  it('should successfully get customers list without pagination params', async () => {
    const repositoryResponse = {
      customers: [
        {
          id: '2a0e2527-2f90-4b9d-9d71-3b9e12f074dc',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          zipCode: '20000000',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      count: 1,
    };

    const expected = {
      list: repositoryResponse.customers,
      meta: {
        currentPage: 1,
        total: repositoryResponse.count,
        lastPage: 1,
      },
    };

    (customersRepository.getCustomers as jest.Mock).mockResolvedValueOnce(
      repositoryResponse
    );

    const result = await getCustomers({});

    expect(result).toStrictEqual(expected);
    expect(customersRepository.getCustomers).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: undefined,
    });
    expect(customersRepository.getCustomers).toHaveBeenCalledTimes(1);
  });
});
