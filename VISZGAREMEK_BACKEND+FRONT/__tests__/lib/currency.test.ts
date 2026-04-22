import { formatCurrency, getCurrencySymbol, CURRENCY_SYMBOLS, CURRENCY_NAMES } from '../../src/lib/currency';

describe('Currency Utilities Tests', () => {
  
  describe('Currency Symbols', () => {
    test('should have USD symbol', () => {
      expect(CURRENCY_SYMBOLS.USD).toBe('$');
    });

    test('should have EUR symbol', () => {
      expect(CURRENCY_SYMBOLS.EUR).toBe('€');
    });

    test('should have HUF symbol', () => {
      expect(CURRENCY_SYMBOLS.HUF).toBe('Ft');
    });
  });

  describe('Currency Names', () => {
    test('should have USD name', () => {
      expect(CURRENCY_NAMES.USD).toBe('USD (amerikai dollár)');
    });

    test('should have EUR name', () => {
      expect(CURRENCY_NAMES.EUR).toBe('EUR (euró)');
    });

    test('should have HUF name', () => {
      expect(CURRENCY_NAMES.HUF).toBe('HUF (magyar forint)');
    });
  });

  describe('Format Currency - HUF', () => {
    test('should format HUF with no decimal places', () => {
      const result = formatCurrency(1000, 'HUF');
      expect(result).toContain('Ft');
      expect(result).toContain('1000');
    });

    test('should format HUF with thousands separator', () => {
      const result = formatCurrency(1000000, 'HUF');
      expect(result).toContain('Ft');
      expect(result.length).toBeGreaterThan(6);
    });

    test('should round HUF amount', () => {
      const result = formatCurrency(1000.5, 'HUF');
      expect(result).toContain('1001');
      expect(result).toContain('Ft');
    });

    test('should handle zero HUF', () => {
      const result = formatCurrency(0, 'HUF');
      expect(result).toContain('0');
      expect(result).toContain('Ft');
    });

    test('should handle negative HUF', () => {
      const result = formatCurrency(-1000, 'HUF');
      expect(result).toContain('Ft');
    });

    test('should use HUF by default', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('Ft');
    });
  });

  describe('Format Currency - USD', () => {
    test('should format USD with 2 decimal places', () => {
      const result = formatCurrency(1000, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,000.00');
    });

    test('should format USD with thousands separator', () => {
      const result = formatCurrency(1000000, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('1,000,000.00');
    });

    test('should handle decimal cents in USD', () => {
      const result = formatCurrency(100.50, 'USD');
      expect(result).toContain('100.50');
      expect(result).toContain('$');
    });

    test('should handle zero USD', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('0.00');
      expect(result).toContain('$');
    });
  });

  describe('Format Currency - EUR', () => {
    test('should format EUR with 2 decimal places', () => {
      const result = formatCurrency(1000, 'EUR');
      expect(result).toContain('€');
      expect(result).toContain('1,000.00');
    });

    test('should format EUR correctly', () => {
      const result = formatCurrency(99.99, 'EUR');
      expect(result).toContain('€');
      expect(result).toContain('99.99');
    });
  });

  describe('Get Currency Symbol', () => {
    test('should get USD symbol', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    test('should get EUR symbol', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    test('should get HUF symbol', () => {
      expect(getCurrencySymbol('HUF')).toBe('Ft');
    });

    test('should use HUF by default', () => {
      expect(getCurrencySymbol()).toBe('Ft');
    });

    test('should return currency code for unknown currency', () => {
      expect(getCurrencySymbol('GBP')).toBe('GBP');
    });

    test('should return currency code for empty string', () => {
      expect(getCurrencySymbol('')).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large amounts', () => {
      const result = formatCurrency(999999999, 'HUF');
      expect(result).toBeDefined();
      expect(result).toContain('Ft');
    });

    test('should handle very small amounts', () => {
      const result = formatCurrency(0.01, 'USD');
      expect(result).toContain('0.01');
    });

    test('should handle negative amounts', () => {
      const result = formatCurrency(-500, 'USD');
      expect(result).toContain('$');
    });
  });
});
