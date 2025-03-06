import type { orderItems } from '../../src/types/order-types';
import { calculateItemsPrice } from '../../src/utils/calculate-items-price';

describe('calculateItemsPrice', () => {
  it('should return the correct total price for order items', () => {
    const orderItems: orderItems['items'] = [
      { quantity: 2, price: '50' },
      { quantity: 1, price: '30' },
      { quantity: 3, price: '20' },
    ];

    const expected = 2 * 50 + 1 * 30 + 3 * 20; // 100 + 30 + 60 = 190

    const result = calculateItemsPrice(orderItems);

    expect(result).toBe(expected);
  });

  it('should handle items with quantity 0 correctly', () => {
    const orderItems: orderItems['items'] = [
      { quantity: 0, price: '50' },
      { quantity: 1, price: '30' },
    ];

    const expected = 0 * 50 + 1 * 30; // 0 + 30 = 30

    const result = calculateItemsPrice(orderItems);

    expect(result).toBe(expected);
  });

  it('should return 0 if no items are provided', () => {
    const orderItems: orderItems['items'] = [];

    const expected = 0;

    const result = calculateItemsPrice(orderItems);

    expect(result).toBe(expected);
  });

  it('should handle fractional prices correctly', () => {
    const orderItems: orderItems['items'] = [
      { quantity: 2, price: '19.99' },
      { quantity: 1, price: '3.50' },
    ];

    const expected = 2 * 19.99 + 1 * 3.5; // 39.98 + 3.50 = 43.48

    const result = calculateItemsPrice(orderItems);

    expect(result).toBeCloseTo(expected, 2);
  });
});
