import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const helloWorldRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/',
    {
      schema: {
        summary: 'Hello World',
        tags: ['health'],
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async request => {
      return { message: 'Hello, Hubii!' };
    }
  );
};
