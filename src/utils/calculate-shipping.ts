import type { Customers } from '@prisma/client';
import type { ShippingInfo } from '../types/shipping-types';
import { shippingCache } from './cache';
import { melhorEnvioClient } from './melhor-envio-client';

export const calculateShipping = async ({
  customer,
}: { customer: Customers }) => {
  if (shippingCache.has(customer.id)) {
    const shippingInfo = shippingCache.get(customer.id) as ShippingInfo;

    if (shippingInfo.zipCode === customer.zipCode) {
      return shippingInfo;
    }
  }

  try {
    const shippingRates = await melhorEnvioClient.getShippingRate({
      customerZipCode: customer.zipCode,
    });

    const prices = shippingRates.map(
      service => service?.price ?? 'Not available'
    );

    const servicesPrices = {
      pac: prices[0],
      sedex: prices[1],
      dotPackage: prices[2],
      dotCom: prices[3],
      expresso: prices[4],
    };

    const shippingInfo = {
      customerId: customer.id,
      zipCode: customer.zipCode,
      ...servicesPrices,
    };

    shippingCache.set(customer.id, shippingInfo);

    return shippingInfo;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to calculate shipping price: ${error?.message}`);
    } else {
      console.error(`Failed to calculate shipping price: ${error}`);
    }

    const shippingInfo = {
      pac: 'Not available',
      sedex: 'Not available',
      dotPackage: 'Not available',
      dotCom: 'Not available',
      expresso: 'Not available',
      customerId: customer.id,
      zipCode: customer.zipCode,
    };

    return shippingInfo;
  }
};
