import { customersRepository } from '../../infra/repositories/customers-repository';
import type { getCustomerShippingParams } from '../../types/customers-types';
import { calculateShipping } from '../../utils/calculate-shipping';

export async function getCustomerShipping({
  customerId,
}: getCustomerShippingParams) {
  const customer = await customersRepository.getCustomerById(customerId);

  if (!customer) {
    throw new Error('Customer not found');
  }

  const shippingInfo = await calculateShipping({ customer });

  return shippingInfo;
}
