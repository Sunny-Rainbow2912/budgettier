export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCostCode = (costCode: string): string => {
  return costCode
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const calculateUtilization = (spent: number, allocated: number): number => {
  if (allocated === 0) return 0;
  // Return actual percentage, even if over 100%
  return (spent / allocated) * 100;
};

export const getUtilizationColor = (percentage: number): string => {
  // Over budget - critical red with pattern
  if (percentage > 100) return 'bg-red-600';
  // Near or at budget - red warning
  if (percentage >= 90) return 'bg-red-500';
  // Approaching budget - yellow caution
  if (percentage >= 75) return 'bg-yellow-500';
  // Moderate usage - blue
  if (percentage >= 50) return 'bg-blue-500';
  // Low usage - green (healthy)
  return 'bg-green-500';
};
