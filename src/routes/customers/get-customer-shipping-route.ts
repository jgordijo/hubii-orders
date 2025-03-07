import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getCustomerShipping } from '../../useCases/customers/calculate-customer-shipping';

export const getCustomerShippingRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/customers/:customerId/shipping',
    {
      schema: {
        summary: 'Gets shipping rate for customer',
        tags: ['customer'],
        params: z.object({
          customerId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            shippingInfo: z.object({
              customerId: z.string(),
              zipCode: z.string(),
              pac: z.union([z.string(), z.number()]),
              sedex: z.union([z.string(), z.number()]),
              dotPackage: z.union([z.string(), z.number()]),
              dotCom: z.union([z.string(), z.number()]),
              expresso: z.union([z.string(), z.number()]),
            }),
          }),
          400: z.object({
            statusCode: z.number(),
            code: z.string(),
            error: z.string(),
            message: z.string(),
          }),
          500: z.object({
            statusCode: z.number(),
            code: z.string(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async request => {
      const { customerId } = request.params;

      const shippingInfo = await getCustomerShipping({ customerId });

      return { shippingInfo };
    }
  );
};
