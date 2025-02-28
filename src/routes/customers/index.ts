import type { FastifyInstance } from 'fastify';
import { getCustomersRoute } from './get-customers-route';

export async function customersRoutes(app: FastifyInstance) {
  app.register(getCustomersRoute);
}
