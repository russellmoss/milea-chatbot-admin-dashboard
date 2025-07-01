import { getAvgResponseTime, getFailedMessages, getMessageCount, getQueryTypes, getQuestionByAnswer } from "../../../../apis/metrics/apis";
import { QueryTypeCounts } from "../../../../apis/metrics/interfaces";
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

const reverseQueryTypesMap = Object.fromEntries(
    Object.entries(queryTypesMap).map(([key, value]) => [value, key])
);


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

    const getTimeRanges = (timeFrame: string) => {
        let currentStart, currentEnd, previousStart, previousEnd;

        const now = new Date();

        switch (timeFrame) {
            case '7days':
                currentEnd = new Date(now);
                currentEnd.setHours(23, 59, 59, 999);
                currentStart = new Date(now);
                currentStart.setDate(currentEnd.getDate() - 6);
                currentStart.setHours(0, 0, 0, 0);

                previousEnd = new Date(currentStart);
                previousEnd.setDate(previousEnd.getDate() - 1);
                previousEnd.setHours(23, 59, 59, 999);
                previousStart = new Date(previousEnd);
                previousStart.setDate(previousEnd.getDate() - 6);
                previousStart.setHours(0, 0, 0, 0);
                break;

            case '1month':
                currentEnd = new Date(now);
                currentEnd.setHours(23, 59, 59, 999);
                currentStart = new Date(now);
                currentStart.setMonth(currentEnd.getMonth() - 1);
                currentStart.setHours(0, 0, 0, 0);

                previousEnd = new Date(currentStart);
                previousEnd.setDate(previousEnd.getDate() - 1);
                previousEnd.setHours(23, 59, 59, 999);
                previousStart = new Date(previousEnd);
                previousStart.setMonth(previousEnd.getMonth() - 1);
                previousStart.setHours(0, 0, 0, 0);
                break;

            case 'quarter':
                currentEnd = new Date(now);
                currentEnd.setHours(23, 59, 59, 999);
                currentStart = new Date(now);
                currentStart.setMonth(currentEnd.getMonth() - 3);
                currentStart.setHours(0, 0, 0, 0);

                previousEnd = new Date(currentStart);
                previousEnd.setDate(previousEnd.getDate() - 1);
                previousEnd.setHours(23, 59, 59, 999);
                previousStart = new Date(previousEnd);
                previousStart.setMonth(previousEnd.getMonth() - 3);
                previousStart.setHours(0, 0, 0, 0);
                break;

            case 'year':
                currentEnd = new Date(now);
                currentEnd.setHours(23, 59, 59, 999);
                currentStart = new Date(now);
                currentStart.setFullYear(currentEnd.getFullYear() - 1);
                currentStart.setHours(0, 0, 0, 0);

                previousEnd = new Date(currentStart);
                previousEnd.setDate(previousEnd.getDate() - 1);
                previousEnd.setHours(23, 59, 59, 999);
                previousStart = new Date(previousEnd);
                previousStart.setFullYear(previousEnd.getFullYear() - 1);
                previousStart.setHours(0, 0, 0, 0);
                break;

            default:
                throw new Error('Unsupported timeFrame');
        }

        return { currentStart, currentEnd, previousStart, previousEnd };
    };

    const { currentStart, currentEnd, previousStart, previousEnd } = getTimeRanges(timeFrame);

    const intervals = createIntervalsByDays(currentStart, currentEnd, timeFrame === 'year' ? 12 : 7);

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

    const currentQueryFailedCounts = Array(queryTypes.length).fill(0);
    const currentQueryTotalCounts = await getQueryTypes(currentStart, currentEnd);
    const previousQueryFailedCounts = Array(queryTypes.length).fill(0);
    const previousQueryTotalCounts = await getQueryTypes(previousStart, previousEnd);

    // Fetch failed messages for both periods
    const currentFailedBotMessages = await getFailedMessages(currentStart, currentEnd);
    const previousFailedBotMessages = await getFailedMessages(previousStart, previousEnd);

    // Process current period
    for (const failedBotMsg of currentFailedBotMessages) {
        const failedBotMsgId = failedBotMsg.id;
        const failedUserMsg = await getQuestionByAnswer(failedBotMsgId);
        const failedUserMsgQueryType = failedUserMsg?.queryType;
        if (failedUserMsgQueryType) {
            const idx = queryTypes.findIndex(type => type === queryTypesMap[failedUserMsgQueryType]);
            if (idx !== -1) {
                currentQueryFailedCounts[idx] += 1;
            }
        }
    }

    // Process previous period
    for (const failedBotMsg of previousFailedBotMessages) {
        const failedBotMsgId = failedBotMsg.id;
        const failedUserMsg = await getQuestionByAnswer(failedBotMsgId);
        const failedUserMsgQueryType = failedUserMsg?.queryType;
        if (failedUserMsgQueryType) {
            const idx = queryTypes.findIndex(type => type === queryTypesMap[failedUserMsgQueryType]);
            if (idx !== -1) {
                previousQueryFailedCounts[idx] += 1;
            }
        }
    }

    // Calculate current and previous query performance
    const currentQueryPerf: Record<string, number> = {};
    const previousQueryPerf: Record<string, number> = {};
    queryTypes.forEach((type, idx) => {
        const key = reverseQueryTypesMap[type] as keyof QueryTypeCounts;
        const currentTotal = currentQueryTotalCounts[key] || 0;
        const previousTotal = previousQueryTotalCounts[key] || 0;

        currentQueryPerf[type] = computeCategoryPerf(currentTotal, currentQueryFailedCounts[idx]);
        previousQueryPerf[type] = computeCategoryPerf(previousTotal, previousQueryFailedCounts[idx]);
    });

    return {
        avgResponseTimeData: {
            labels: results.map(({ start }) => start.toLocaleDateString()),
            datasets: [
                {
                    label: 'Average Response Time (s)',
                    data: results.map(({ avgResponseTimeInMs }) =>
                        parseFloat((avgResponseTimeInMs / 1000).toFixed(2))
                    ),
                    backgroundColor: '#715100',
                },
            ],
        },
        queryTypeData: {
            labels: queryTypes,
            datasets: [
                {
                    data: queryTypes.map((type) => {
                        const key = Object.keys(queryTypesMap).find((k) => queryTypesMap[k] === type) as keyof QueryTypeCounts;
                        return results.reduce((sum, { queryTypeDistribution }) => {
                            if (key && queryTypeDistribution[key]) {
                                return sum + queryTypeDistribution[key];
                            }
                            return sum;
                        }, 0);
                    }),
                    backgroundColor: [
                        '#797d62',
                        '#9b9b7a',
                        '#d9ae94',
                        '#e5c59e',
                        '#f1dca7',
                        '#f8d488',
                        '#e4b074',
                        '#d08c60',
                        '#997b66',
                    ],
                    borderColor: '#FFFFFF',
                    borderWidth: 1,
                },
            ],
        },
        queryPerformanceData: {
            labels: queryTypes,
            datasets: [
                {
                    label: 'Current',
                    data: queryTypes.map((type) => currentQueryPerf[type] || 0),
                    backgroundColor: 'rgba(90, 48, 0, 0.2)',
                    borderColor: '#606c38',
                    pointBackgroundColor: '#606c38',
                },
                {
                    label: 'Previous Period',
                    data: queryTypes.map((type) => previousQueryPerf[type] || 0),
                    backgroundColor: 'rgba(0, 113, 66, 0.2)',
                    borderColor: '#283618',
                    pointBackgroundColor: '#283618',
                },
            ],
        },
        queryImprovementData: queryTypes.map((type) => {
            return {
                category: type,
                current_score: currentQueryPerf[type] || 0,
                target_score: 8.5,
                action_items: [],
            };
        })
    };
};

export const computeCategoryPerf = (total: number, failed: number): number => {
    if (total === 0 || failed === 0) return 10;
    const perf = (total - failed) / total;
    return Number((perf * 100 / 10).toFixed(1));
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