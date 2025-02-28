import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { Prisma } from '@prisma/client';
import { fastify } from 'fastify';
import {
  type ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { customersRoutes } from './routes/customers';
import { helloWorldRoute } from './routes/hello-world-route';

const app = fastify({
  logger: {
    level: 'error',
    transport: {
      target: 'pino-pretty',
    },
  },
}).withTypeProvider<ZodTypeProvider>();

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(400).send({
      error: 'Response Validation Error',
      code: 'VALIDATION_ERROR',
      message: `Request doesn't match the schema: ${error.message}`,
      statusCode: 400,
    });
  }

  if (isResponseSerializationError(error)) {
    return reply.code(500).send({
      error: 'Internal Server Error',
      code: 'VALIDATION_ERROR',
      message: `Response doesn't match the schema: ${error.message}`,
      statusCode: 500,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        code: 'DATABASE_ERROR',
        error: 'Register not found',
        message: 'The requested resource was not found.',
      });
    }

    if (error.code === 'P2034') {
      return reply.status(400).send({
        statusCode: 400,
        code: 'DATABASE_ERROR',
        error: 'Transaction Failed',
        message:
          'Transaction failed due to a write conflict or a deadlock. Please retry your transaction',
      });
    }

    return reply.status(500).send({
      statusCode: 500,
      code: 'DATABASE_ERROR',
      error: 'Database error',
      message: error.message,
    });
  }

  return reply.status(500).send({
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    error: 'Internal Server Error',
    message: `Something went wrong: ${error.message}`,
  });
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Hubii Orders',
      version: '0.0.1',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(helloWorldRoute);
app.register(customersRoutes);

export { app };
