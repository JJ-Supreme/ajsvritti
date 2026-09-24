export const formatPrice = (price: number | string): string => {
  // Convert string to number if needed
  const amount = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format the number with Indian Rupee symbol and Indian number format
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CURRENCY = '₹';
