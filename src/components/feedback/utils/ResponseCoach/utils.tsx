import { getConvFeedbacks } from "../../../../apis/metrics/apis";
import { Feedback, Message } from "../../../../apis/metrics/interfaces";
import { Feedback as FeedbackData } from "./interfaces";

const getFeedbackCategory = (feedback: Feedback): string => {
    const queryTypes = [];
    for (const message of feedback.messages) {
        if (message.sender === 'user' && message.queryType) {
            queryTypes.push(message.queryType);
        }
    }
    return queryTypes.join(', ');
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
            category: getFeedbackCategory(feedback),
            status: feedback.feedback.rating <= 2 ? 'Negative' : 'Positive',
        }));
        return data;
    } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
        throw error;
    }
}

export const findFirstUserMsg = (messages: Message[]): Message => {
    return messages.find(msg => msg.sender === 'user')!;
}


