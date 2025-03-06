import { env } from '../env';
import type {
  getProductsParams,
  getProductsResponse,
  updateProductStockBody,
} from '../types/products-type';

export const productsClient = {
  getProducts: async ({ productsIds }: getProductsParams) => {
    const query = `productIds=${productsIds.join(',')}`;

    const response = await fetch(`${env.PRODUCTS_API_URL}/products?${query}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch products (HTTP ${response.status})`);
    }

    const parsedResponse = (await response.json()) as getProductsResponse;

    return { products: parsedResponse.list };
  },
  updateStock: async ({ products }: updateProductStockBody) => {
    const body = JSON.stringify({ products });

    const response = await fetch(`${env.PRODUCTS_API_URL}/products/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update products stock (HTTP ${response.status})`
      );
    }
  },
};
