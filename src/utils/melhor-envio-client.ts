import { env } from '../env';
import type { getCustomerShippingMelhorEnvioParams } from '../types/customers-types';
import type { ShippingRateResponse } from '../types/shipping-types';

export const melhorEnvioClient = {
  getShippingRate: async ({
    customerZipCode,
  }: getCustomerShippingMelhorEnvioParams) => {
    const requestBody = {
      from: { postal_code: env.WAREHOUSE_ZIPCODE },
      to: { postal_code: customerZipCode },
      package: {
        // As mentioned on the readme file, for simplicity purposes, all orders will contain a single package with fixed dimensions
        height: 10,
        width: 15,
        length: 20,
        weight: 1,
      },
      services: '1,2,3,4,5', // PAC, SEDEX, .Package, .Com and Expresso
    };

    const response = await fetch(
      `${env.MELHOR_ENVIO_API_URL}/api/v2/me/shipment/calculate`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.MELHOR_ENVIO_ACCESS_TOKEN}`,
          'User-Agent': 'Orders POC (orders@putsbox.com)',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error to calculate shipping: ${response.status} - ${response.statusText}`
      );
    }

    return (await response.json()) as ShippingRateResponse['shippingServices'];
  },
};
