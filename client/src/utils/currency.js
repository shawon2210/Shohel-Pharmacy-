<<<<<<< HEAD
export const CURRENCY_SYMBOL = '৳';

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `${CURRENCY_SYMBOL}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
=======
export const CURRENCY_SYMBOL = '৳';

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `${CURRENCY_SYMBOL}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
