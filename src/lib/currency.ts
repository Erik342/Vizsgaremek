export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  HUF: 'Ft',
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'USD (amerikai dollár)',
  EUR: 'EUR (euró)',
  HUF: 'HUF (magyar forint)',
};

export function formatCurrency(amount: number, currency: string = 'HUF'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Format number based on currency
  let formatted = '';
  if (currency === 'HUF') {
    // HUF: no decimal places, space as thousands separator
    formatted = Math.round(amount).toLocaleString('hu-HU');
  } else {
    // USD, EUR: 2 decimal places
    formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  
  return `${formatted} ${symbol}`;
}

export function getCurrencySymbol(currency: string = 'HUF'): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
