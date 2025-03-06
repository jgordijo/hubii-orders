import { OrderStatus, Prisma } from '@prisma/client';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getOrder } from '../../useCases/orders/get-order';

export const getOrderRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/orders/:orderId',
    {
      schema: {
        summary: 'Retrieves an existing order',
        tags: ['orders'],
        params: z.object({
          orderId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            order: z.object({
              id: z.string().uuid(),
              customerId: z.string(),
              total: z.instanceof(Prisma.Decimal),
              shippingPrice: z.instanceof(Prisma.Decimal),
              status: z.nativeEnum(OrderStatus),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
              products: z
                .object({
                  productId: z.string().uuid(),
                  productName: z.string(),
                  price: z.instanceof(Prisma.Decimal),
                  quantity: z.number(),
                })
                .array(),
            }),
          }),
          404: z.object({
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
    async (request, reply) => {
      const { orderId } = request.params;

      const order = await getOrder({
        orderId,
      });

      if (!order) {
        return reply.status(404).send({
          statusCode: 404,
          code: 'NOT_FOUND',
          error: 'Resource not found',
          message: `Order ${orderId} not found`,
        });
      }

      return { order };
    }
  );
};
