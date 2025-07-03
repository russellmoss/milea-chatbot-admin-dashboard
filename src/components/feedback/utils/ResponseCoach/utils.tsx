import { getAllFeedbacks, createFeedback } from "../../../../apis/dashboard/apis";
import { FeedbackModel } from "../../../../apis/dashboard/interfaces";
import { getConvFeedbacks } from "../../../../apis/metrics/apis";
import { Feedback, Message } from "../../../../apis/metrics/interfaces";
import { ResponseImprovements, ResponseImprovement } from "./interfaces";


const getFeedbackCategory = (feedback: Feedback): string[] => {
    const queryTypes = new Set<string>();
    for (const message of feedback.messages) {
        if (message.sender === 'user' && message.queryType) {
            queryTypes.add(message.queryType);
        }
    }
    if (queryTypes.size === 0) {
        return ['others'];
    }
    return Array.from(queryTypes);
}

// Store feedbacks in dashboard db when pulling from chatbot db
export const upsertDashboardDbFeedbacks = async() => {
    try {
        const feedbacks = await getConvFeedbacks(new Date('1900-01-01'), new Date());
        const allStoredFeedbacks = await getAllFeedbacks();
        const allStoredFeedbackSessionIds = new Set(allStoredFeedbacks.map(f => f.sessionId));
        const allFeedbacks = allStoredFeedbacks;
        for (const feedback of feedbacks) {
            if (!allStoredFeedbackSessionIds.has(feedback.sessionId)) {
                const newFeedback = await createFeedback({
                    sessionId: feedback.sessionId,
                    userId: feedback.userId,
                    timestamp: feedback.endTime,
                    messages: feedback.messages,
                    categories: getFeedbackCategory(feedback),
                    feedback: {
                        rating: feedback.feedback.rating,
                        comment: feedback.feedback.details
                    },
                    negative: feedback.feedback.rating <= 2,
                });
                allStoredFeedbackSessionIds.add(feedback.sessionId);
                allFeedbacks.push(newFeedback);
            }
        }
        return allFeedbacks;
    } catch (error) {
        console.error('Failed to upsert feedbacks in dashboard db:', error);
        throw error;
    }
}

export const findFirstUserMsg = (messages: Message[]): Message => {
    return messages.find(msg => msg.sender === 'user')!;
}

export const generateInitialImprovedResponse = (feedbacks: FeedbackModel[]): Record<string, ResponseImprovements> => {
    const initialResponse: Record<string, ResponseImprovements> = {};
    feedbacks.forEach(feedback => {
        feedback.messages.forEach(message => {
            if (message.sender === 'bot') {
                const classifiedIssueInDb = feedback.responseImprovement.find(ri => ri.responseId === message.id)?.issueClassified || "";
                const improvedRespInDb = feedback.responseImprovement.find(ri => ri.responseId === message.id)?.improvedResponse || "";
                initialResponse[feedback.sessionId] = {
                    impact: feedback.impact as ("Low" | "Medium" | "High" | "Very High"),
                    responseImprovements: [{
                        responseId: message.id,
                        response: message.content,
                        issueClassified: classifiedIssueInDb,
                        improvedResponse: improvedRespInDb,
                    }],
                };
            }
        });
    });
    return initialResponse;
};

export const checkIfOneImprovementExists = (improvements: ResponseImprovement[]): boolean => {
    for (const improvement of improvements) {
        if (improvement.issueClassified && improvement.improvedResponse) {
            return true;
        }
    }
    return false;
}

