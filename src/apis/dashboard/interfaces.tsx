import { Message } from '../metrics/interfaces';


interface ResponseImprovement{
    responseId: string;
    response: string
    issueClassified: string
    improvedResponse: string
}

export interface FeedbackModel {
    sessionId: string;
    userId: string;
    timestamp: string;
    categories: string[];
    responseImprovement: ResponseImprovement[];
    all_analyzed: boolean;
    messages: Message[];
    feedback: {
        rating: number;
        comment: string;
    };
    negative: boolean;
    impact: string;
    status: string;
}

interface MessageFeedback {
    rating: number;
    comment: string;
}

export interface CreateFeedbackRequest {
    sessionId: string;
    userId: string;
    timestamp: string;
    categories: string[];
    messages: Message[];
    feedback: MessageFeedback;
    negative: boolean;
}

export interface UpdateFeedbackRequest {
    sessionId: string;
    responseImprovement: ResponseImprovement[];
    all_analyzed: boolean;
    impact: string;
    status: string;
}
