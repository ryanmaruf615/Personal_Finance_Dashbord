const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  PLN: 'zł',
};

const CURRENCY_LOCALES = {
  EUR: 'de-DE',
  USD: 'en-US',
  GBP: 'en-GB',
  CHF: 'de-CH',
  PLN: 'pl-PL',
};

export const formatCurrency = (amount, currency = 'EUR') => {
  const locale = CURRENCY_LOCALES[currency] || 'de-DE';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${Number(amount).toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currency = 'EUR') => {
  return CURRENCY_SYMBOLS[currency] || currency;
};
