import { customersRepository } from '../../infra/repositories/customers-repository';
import type { getCustomersParams } from '../../types/customers-types';

export async function getCustomers({
  page = 1,
  pageSize = 10,
  name,
  email,
}: getCustomersParams) {
  const { customers, count } = await customersRepository.getCustomers({
    page,
    pageSize,
    name,
    email,
  });

  return {
    list: customers,
    meta: {
      currentPage: page,
      total: count,
      lastPage: Math.ceil(count / pageSize),
    },
  };
}
