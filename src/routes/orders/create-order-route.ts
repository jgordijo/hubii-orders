import { OrderStatus, Prisma } from '@prisma/client';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createOrder } from '../../useCases/orders/create-order';

export const createOrderRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/orders',
    {
      schema: {
        summary: 'Creates a new order',
        tags: ['orders'],
        body: z.object({
          customerId: z.string().uuid(),
          items: z
            .object({
              productId: z.string().uuid(),
              quantity: z.number().int().positive(),
            })
            .array(),
        }),
        response: {
          200: z.object({
            order: z.object({
              id: z.string().uuid(),
              customerId: z.string().uuid(),
              total: z.instanceof(Prisma.Decimal),
              shippingPrice: z.instanceof(Prisma.Decimal),
              status: z.nativeEnum(OrderStatus),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
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
      const { customerId, items } = request.body;

      const { order } = await createOrder({
        customerId,
        items,
      });

      return { order };
    }
  );
};
