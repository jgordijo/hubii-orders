import type { FastifyInstance } from 'fastify';
import { createOrderRoute } from './create-order-route';

export async function orderRoutes(app: FastifyInstance) {
  app.register(createOrderRoute);
}
