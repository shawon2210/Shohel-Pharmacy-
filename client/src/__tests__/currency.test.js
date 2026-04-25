import { CURRENCY_SYMBOL, formatCurrency, formatNumber } from '../utils/currency';

describe('currency util', () => {
  test('CURRENCY_SYMBOL is correct', () => {
    expect(CURRENCY_SYMBOL).toBe('৳');
  });

  test('formatCurrency formats numbers with symbol and two decimals', () => {
    expect(formatCurrency(1000)).toBe('৳1,000.00');
    expect(formatCurrency(1234.5)).toBe('৳1,234.50');
    expect(formatCurrency('500')).toBe('৳500.00');
  });

  test('formatNumber returns localized number with two decimals', () => {
    expect(formatNumber(1000)).toBe('1,000.00');
    expect(formatNumber(12)).toBe('12.00');
  });
});
