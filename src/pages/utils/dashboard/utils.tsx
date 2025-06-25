export const computeConvRisePercent = (current: number, previous: number): string => {
  if (previous === 0) {
    return current > 0 ? '100%' : '0%';
  }
  const rise = ((current - previous) / previous) * 100;
  return `${rise.toFixed(2)}%`;
}