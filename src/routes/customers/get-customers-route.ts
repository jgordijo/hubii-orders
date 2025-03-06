import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getCustomers } from '../../useCases/customers/get-customers';

export const getCustomersRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/customers',
    {
      schema: {
        summary: 'Retrieves customers list',
        tags: ['customers'],
        querystring: z.object({
          page: z.coerce.number().default(1),
          pageSize: z.coerce.number().default(10),
          name: z.string().optional(),
          email: z.string().optional(),
        }),
        response: {
          200: z.object({
            list: z
              .object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email(),
                zipCode: z.string(),
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
      const { page, pageSize, name, email } = request.query;

      const { list, meta } = await getCustomers({
        page,
        pageSize,
        name,
        email,
      });

      return { list, meta };
    }
  );
};
