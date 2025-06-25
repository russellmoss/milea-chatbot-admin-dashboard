import { getConversationCount, getFailedConversations } from '../../../apis/metrics/apis';
import { convChartConversationColor, convChartSuccessfulColor } from './chart';


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

export const fetchConversationChartData = async (dateRange: string, customDateRange: { start: string; end: string }) => {
  const createIntervalsByDays = (start: Date, end: Date, parts: number) => {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const daysPerInterval = Math.ceil(totalDays / parts);

    const intervals = [];

    for (let i = 0; i < parts; i++) {
      const intervalStart = new Date(startDate);
      intervalStart.setDate(startDate.getDate() + i * daysPerInterval);

      const intervalEnd = new Date(startDate);
      const tentativeEnd = startDate.getDate() + (i + 1) * daysPerInterval - 1;
      intervalEnd.setDate(tentativeEnd);
      intervalEnd.setHours(23, 59, 59, 999);

      if (intervalEnd > endDate) {
        intervalEnd.setTime(endDate.getTime());
      }

      intervals.push({ start: intervalStart, end: intervalEnd });

      if (intervalEnd.getTime() >= endDate.getTime()) {
        break;
      }
    }

    return intervals;
  };

  let intervals: { start: Date; end: Date }[] = [];

  switch (dateRange) {
    case '7days': {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      intervals = createIntervalsByDays(start, end, 7);
      break;
    }
    case '1month': {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setMonth(end.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      intervals = createIntervalsByDays(start, end, 7);
      break;
    }
    case 'quarter': {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const start = new Date();
      start.setMonth(end.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      intervals = createIntervalsByDays(start, end, 7);
      break;
    }
    case 'custom': {
      if (!customDateRange.start || !customDateRange.end) {
        console.warn('Custom date range is not properly set');
        return null;
      }
      const start = new Date(customDateRange.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999);
      intervals = createIntervalsByDays(start, end, 7);
      break;
    }
    default:
      return null;
  }

  const results = await Promise.all(
    intervals.map(async ({ start, end }) => {
      const total = await getConversationCount(start, end);
      const failed = await getFailedConversations(start, end);
      const successful = total - (failed.length || 0);
      return {
        start,
        end,
        total,
        successful,
      };
    })
  );

  return {
    labels: results.map(({ start }) => start.toLocaleDateString()),
    datasets: [
      {
        label: 'Total Conversations',
        data: results.map(({ total }) => total),
        borderColor: convChartConversationColor,
        backgroundColor: 'rgba(90, 62, 0, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Successful Resolutions',
        data: results.map(({ successful }) => successful),
        borderColor: convChartSuccessfulColor,
        backgroundColor: 'rgba(113, 81, 0, 0.1)',
        tension: 0.3,
      },
    ],
  };
};