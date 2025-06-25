export const computeRisePercent = (current: number, previous: number): string => {
  if (previous === 0) {
    if (current === 0) return '0%';
    return '∞%';
  }
  const rise = ((current - previous) / previous) * 100;
  const sign = rise >= 0 ? '+' : '';
  return `${sign}${rise.toFixed(2)}%`;
};


export const calculateResolutionRate = (total: number, failed: number): number => {
  return total === 0 ? 0 : (total - failed) / total;
};