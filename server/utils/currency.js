// Server-side currency utility
// Keep in sync with client/src/utils/currency.js
const CURRENCY_SYMBOL = '৳';

function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `${CURRENCY_SYMBOL}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = {
  CURRENCY_SYMBOL,
  formatCurrency,
  formatNumber
};
