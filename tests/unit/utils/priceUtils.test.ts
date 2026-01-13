import { generateRandomPrice } from '../../../src/utils/priceUtils';

describe('Price Utils', () => {
  describe('generateRandomPrice', () => {
    it('should generate a price within the default range (5-50)', () => {
      const price = generateRandomPrice();
      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(50);
    });

    it('should generate a price within custom range', () => {
      const min = 10;
      const max = 20;
      const price = generateRandomPrice(min, max);
      expect(price).toBeGreaterThanOrEqual(min);
      expect(price).toBeLessThanOrEqual(max);
    });

    it('should generate price with 2 decimal places', () => {
      const price = generateRandomPrice();
      const decimalPlaces = (price.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should generate different prices on multiple calls', () => {
      const prices = Array.from({ length: 10 }, () => generateRandomPrice());
      const uniquePrices = new Set(prices);
      // At least some prices should be different (very unlikely all 10 are the same)
      expect(uniquePrices.size).toBeGreaterThan(1);
    });
  });
});

