import { env } from '../../src/env';
import { stockActionEnum } from '../../src/types/products-type';
import { productsClient } from '../../src/utils/products-client';

global.fetch = jest.fn();

describe('productsClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should successfully fetch products', async () => {
      const mockResponse = {
        list: [
          { id: 'product-1', name: 'Product 1', price: '10.00' },
          { id: 'product-2', name: 'Product 2', price: '20.00' },
        ],
      };

      const productsIds = ['product-1', 'product-2'];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await productsClient.getProducts({ productsIds });

      const query = `productIds=${productsIds.join(',')}`;

      expect(fetch).toHaveBeenCalledWith(
        `${env.PRODUCTS_API_URL}/products?${query}`
      );
      expect(result).toEqual({ products: mockResponse.list });
    });

    it('should throw an error if the response is not ok', async () => {
      const productsIds = ['product-1', 'product-2'];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      });

      await expect(productsClient.getProducts({ productsIds })).rejects.toThrow(
        'Failed to fetch products (HTTP 500)'
      );
    });
  });

  describe('updateStock', () => {
    it('should successfully update product stock', async () => {
      const updateStockBody = {
        products: [
          {
            productId: 'product-1',
            quantity: 5,
            action: stockActionEnum.SELL,
            description: 'Selling for order 123',
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

      await expect(
        productsClient.updateStock(updateStockBody)
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        `${env.PRODUCTS_API_URL}/products/stock`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateStockBody), // Certifique-se de que o corpo enviado é o correto
        })
      );
    });

    it('should throw an error if the response is not ok', async () => {
      const updateStockBody = {
        products: [
          {
            productId: 'product-1',
            quantity: 5,
            action: stockActionEnum.SELL,
            description: 'Selling for order 123',
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });

      await expect(productsClient.updateStock(updateStockBody)).rejects.toThrow(
        'Failed to update products stock (HTTP 400)'
      );
    });
  });
});
