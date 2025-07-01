import { getAvgResponseTime, getFailedMessages, getMessageCount, getQueryTypes } from "../../../../apis/metrics/apis";
import { queryTypes } from "./static";

const queryTypesMap: Record<string, string> = {
    'wine_info': 'Wine Info',
    'club_membership': 'Club Membership',
    'visiting_hours': 'Visiting Hours',
    'reservation': 'Reservation',
    'events': 'Events',
    'user_profile': 'User Profile',
    'sms': 'SMS',
    'referral': 'Referral',
    'others': 'Others'
}


export const fetchQualityMetricsCharts = async (timeFrame: string) => {
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

    switch (timeFrame) {
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
    case 'year': {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setFullYear(end.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        intervals = createIntervalsByDays(start, end, 12);
        break;
    }
    default:
        return null;
    }

    const results = await Promise.all(
        intervals.map(async ({ start, end }) => {
            const avgResponseTimeInMs = await getAvgResponseTime(start, end);
            const queryTypeDistribution = await getQueryTypes(start, end);
            return {
                start,
                end,
                avgResponseTimeInMs,
                queryTypeDistribution,
            };
        })
    );

    return{
        "avgResponseTimeData": {
            labels: results.map(({ start }) => start.toLocaleDateString()),
            datasets: [
                {
                    label: 'Average Response Time (s)',
                    data: results.map(({ avgResponseTimeInMs }) => parseFloat((avgResponseTimeInMs / 1000).toFixed(2))),
                    backgroundColor: '#715100',
                }
            ],
        },
        "queryTypeData": {
            labels: queryTypes,
            datasets: [
                {
                    data: queryTypes.map(type => {
                        const key = Object.keys(queryTypesMap).find(k => queryTypesMap[k] === type);
                        return results.reduce((sum, { queryTypeDistribution }) => {
                            if (key && queryTypeDistribution[key]) {
                                return sum + queryTypeDistribution[key];
                            }
                            return sum;
                        }, 0);
                    }),
                    backgroundColor: [ '#797d62', '#9b9b7a', '#d9ae94', '#e5c59e', '#f1dca7', '#f8d488', '#e4b074', '#d08c60', '#997b66'],
                    borderColor: '#FFFFFF',
                    borderWidth: 1
                }
            ]
        }
    }
}

export const computeResponseAccuracy = (messageCount: number, failedMessages: number): number => {
    if (messageCount === 0) return 0;
    const accuracy = (messageCount - failedMessages) / messageCount;
    return accuracy
}

export const fetchQualityMetricsData = async() => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfThisMonth.setHours(0, 0, 0, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    const [
        avgResponseTimeThisMonth, avgResponseTimeLastMonth,
        failedMessagesThisMonth, failedMessagesLastMonth,
        messageCountThisMonth, messageCountLastMonth
    ] = await Promise.all([
        getAvgResponseTime(startOfThisMonth, now),
        getAvgResponseTime(startOfLastMonth, endOfLastMonth),
        getFailedMessages(startOfThisMonth, now),
        getFailedMessages(startOfLastMonth, endOfLastMonth),
        getMessageCount(startOfThisMonth, now),
        getMessageCount(startOfLastMonth, endOfLastMonth),
    ]);

    return {
        "response_accuracy": {
            "this_month": computeResponseAccuracy(messageCountThisMonth.bot, failedMessagesThisMonth.length),
            "last_month": computeResponseAccuracy(messageCountLastMonth.bot, failedMessagesLastMonth.length)
        },
        "avg_response_time": {
            "this_month": avgResponseTimeThisMonth,
            "last_month": avgResponseTimeLastMonth,
        },
    }
}

export const computeAvgRespTimeDiff = (thisMonth: number, lastMonth: number): string => {
    const diff = thisMonth - lastMonth;
    if (diff === 0) return "No change compared to last month";
    if (lastMonth === 0) return "New data";
    return `${(diff / 1000).toFixed(2)} s from last month`;
}