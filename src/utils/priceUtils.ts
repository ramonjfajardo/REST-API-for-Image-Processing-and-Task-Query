/**
 * Generate a random price between min and max (inclusive)
 */
export function generateRandomPrice(min: number = 5, max: number = 50): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

