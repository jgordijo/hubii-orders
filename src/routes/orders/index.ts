import type { FastifyInstance } from 'fastify';
import { createOrderRoute } from './create-order-route';
import { getOrderRoute } from './get-order-route';

export async function orderRoutes(app: FastifyInstance) {
  app.register(createOrderRoute);
  app.register(getOrderRoute);
}
