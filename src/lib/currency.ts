/**
 * Format a number as Indian Rupee currency
 */
export function formatRupee(amount: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

/**
 * Format a number as Indian Rupee currency without symbol (for use in charts/tooltips)
 */
export function formatRupeeValue(amount: number, options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options || {};
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

/**
 * Format large numbers with K, L, Cr suffixes (Indian numbering system)
 */
export function formatRupeeCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)}K`;
  }
  return formatRupee(amount);
}

