import { OrderStatus, Prisma } from '@prisma/client';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getOrders } from '../../useCases/orders/get-orders';

export const getOrdersRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/orders',
    {
      schema: {
        summary: 'Retrieves order list',
        tags: ['orders'],
        querystring: z.object({
          page: z.coerce.number().default(1),
          pageSize: z.coerce.number().default(10),
          customerId: z.string().optional(),
          status: z.nativeEnum(OrderStatus).optional(),
        }),
        response: {
          200: z.object({
            list: z
              .object({
                id: z.string().uuid(),
                customerId: z.string(),
                total: z.instanceof(Prisma.Decimal),
                shippingPrice: z.instanceof(Prisma.Decimal),
                status: z.nativeEnum(OrderStatus),
                createdAt: z.coerce.date(),
                updatedAt: z.coerce.date(),
              })
              .array(),
            meta: z.object({
              currentPage: z.number(),
              lastPage: z.number(),
              total: z.number(),
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
      const { page, pageSize, customerId, status } = request.query;

      const { list, meta } = await getOrders({
        page,
        pageSize,
        customerId,
        status,
      });

      return { list, meta };
    }
  );
};
