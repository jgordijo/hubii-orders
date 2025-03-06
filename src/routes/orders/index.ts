import type { FastifyInstance } from 'fastify';
import { createOrderRoute } from './create-order-route';
import { getOrderRoute } from './get-order-route';
import { getOrdersRoute } from './get-orders-route';

export async function orderRoutes(app: FastifyInstance) {
  app.register(getOrdersRoute);
  app.register(createOrderRoute);
  app.register(getOrderRoute);
}
