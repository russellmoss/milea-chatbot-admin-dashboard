import { getAllFeedbacks, createFeedback } from "../../../../apis/dashboard/apis";
import { getConvFeedbacks } from "../../../../apis/metrics/apis";
import { Feedback, Message } from "../../../../apis/metrics/interfaces";
import { Feedback as FeedbackData } from "./interfaces";

const getFeedbackCategory = (feedback: Feedback, returnList = false): string | string[] => {
    const queryTypes = new Set<string>();
    for (const message of feedback.messages) {
        if (message.sender === 'user' && message.queryType) {
            queryTypes.add(message.queryType);
        }
    }
    if (returnList) {
        return Array.from(queryTypes);
    }
    return Array.from(queryTypes).join(', ');
}


export const fetchFeedbacks = async() => {
    try {
        const feedbacks = await getConvFeedbacks(new Date('1900-01-01'), new Date());
        const data: FeedbackData[] = feedbacks.map((feedback: Feedback, idx: number) => ({
            id: idx,
            user: `User #${feedback.userId}`,
            timestamp: feedback.endTime,
            messages: feedback.messages,
            feedback: {
                rating: feedback.feedback.rating,
                comment: feedback.feedback.details
            },
            category: getFeedbackCategory(feedback) as string,
            status: feedback.feedback.rating <= 2 ? 'Negative' : 'All',
        }));
        return data;
    } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
        throw error;
    }
}

// Store feedbacks in dashboard db when pulling from chatbot db
export const upsertDashboardDbFeedbacks = async() => {
    try {
        const feedbacks = await getConvFeedbacks(new Date('1900-01-01'), new Date());
        const allStoredFeedbacks = await getAllFeedbacks();
        const allStoredFeedbackSessionIds = new Set(allStoredFeedbacks.map(f => f.sessionId));
        for (const feedback of feedbacks) {
            if (!allStoredFeedbackSessionIds.has(feedback.sessionId)) {
                await createFeedback({
                    sessionId: feedback.sessionId,
                    userId: feedback.userId,
                    categories: getFeedbackCategory(feedback, true) as string[],
                    message_count: feedback.messages.length,
                });
                allStoredFeedbackSessionIds.add(feedback.sessionId);
            }
        }
    } catch (error) {
        console.error('Failed to upsert feedbacks in dashboard db:', error);
        throw error;
    }
}

export const findFirstUserMsg = (messages: Message[]): Message => {
    return messages.find(msg => msg.sender === 'user')!;
}


