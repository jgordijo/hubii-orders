import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3334),
  DATABASE_URL: z.string().url(),
  PRODUCTS_API_URL: z.string().url(),
  WAREHOUSE_ZIPCODE: z.string(),
});

export const env = envSchema.parse(process.env);
