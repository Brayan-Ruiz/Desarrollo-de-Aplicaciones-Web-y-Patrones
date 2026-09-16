/**
 * Antigravity Finance - Formatters Utility
 * Soporte reactivo para múltiples monedas y fechas internacionales.
 */

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  CRC: { code: 'CRC', symbol: '₡', name: 'Colón Costarricense', locale: 'es-CR' },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  GBP: { code: 'GBP', symbol: '£', name: 'Libra Esterlina', locale: 'en-GB' },
  COP: { code: 'COP', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' }
};

/**
 * Formatea un número como moneda según la divisa seleccionada.
 * @param {number} amount
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const num = Number(amount) || 0;
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.code === 'CRC' || config.code === 'COP' ? 0 : 2,
      maximumFractionDigits: config.code === 'CRC' || config.code === 'COP' ? 0 : 2
    }).format(num);
  } catch (e) {
    return `${config.symbol} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Formatea un porcentaje con signo opcional.
 * @param {number} value
 * @param {boolean} includeSign
 * @returns {string}
 */
export function formatPercentage(value, includeSign = false) {
  const num = Number(value) || 0;
  const formatted = `${num.toFixed(1)}%`;
  if (includeSign && num > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Formatea una fecha en formato YYYY-MM-DD o formato legible.
 * @param {string|Date} dateStr
 * @param {boolean} humanReadable
 * @returns {string}
 */
export function formatDate(dateStr, humanReadable = false) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  if (!humanReadable) {
    return date.toISOString().split('T')[0];
  }

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

/**
 * Obtiene el nombre del mes y año legible (ej: "Septiembre 2026").
 * @param {string} yearMonth 'YYYY-MM'
 * @returns {string}
 */
export function formatMonthYear(yearMonth) {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
}
