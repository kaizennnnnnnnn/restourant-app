/**
 * Format a number as a USD price string, e.g. 12.5 → "$12.50"
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

/**
 * Format an ISO date string as a short time, e.g. "2:30 PM"
 * @param {string} iso
 * @returns {string}
 */
export function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
