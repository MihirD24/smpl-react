
export const formatDate = (
  rawDate: Date | string,
  type: 'display' | 'server' = 'display',
): string => {
  if (!rawDate) return '';

  const date = new Date(rawDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return type === 'display'
    ? `${day}/${month}/${year}`
    : `${year}-${month}-${day}`;
};

/**
 * Feb 01
 */
export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
  });
};

/**
 * Feb 28, 2026
 */
export const formatFullDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
};

/**
 * February 2026
 */
export const formatMonthYear = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Currency formatter
 */
export const formatCurrency = (
  val: string | number | null,
): string => {
  const num = typeof val === 'string' ? parseFloat(val) : val ?? 0;

  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};