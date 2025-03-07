import type { FastifyInstance } from 'fastify';
import { getCustomerShippingRoute } from './get-customer-shipping-route';
import { getCustomersRoute } from './get-customers-route';

export async function customersRoutes(app: FastifyInstance) {
  app.register(getCustomersRoute);
  app.register(getCustomerShippingRoute);
}
