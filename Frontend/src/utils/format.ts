/**
 * Formats a number into Vietnamese Dong (VNĐ) currency string.
 * Example: 2500000000 -> "2.500.000.000 VNĐ"
 */
export const formatPrice = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0 VNĐ';
  return `${value.toLocaleString('vi-VN')} VNĐ`;
};
