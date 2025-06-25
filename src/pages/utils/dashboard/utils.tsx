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


export const computeDataCaptureRate = (user_count: number, ip_count: number): number => {
  return user_count === 0 ? 0 : (ip_count / user_count);
};

export const computeClubConversation = (clubSignups: number, uniqueUsers: number): number => {
  return uniqueUsers === 0 ? 0 : (clubSignups / uniqueUsers);
};
