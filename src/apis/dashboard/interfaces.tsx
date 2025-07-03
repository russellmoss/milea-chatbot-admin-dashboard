interface ResponseImprovement{
    response: string
    issueClassified: string
    improvedResponse: string
    timestamp: Date
}

export interface FeedbackModel {
    sessionId: string;
    userId: string;
    categories: string[];
    responseImprovement: ResponseImprovement[];
    all_analyzed: boolean;
    message_count: number;
    impact: string;
    status: string;
}

export interface CreateFeedbackRequest {
    sessionId: string;
    userId: string;
    categories: string[];
    message_count: number;
}

export interface UpdateFeedbackRequest {
    sessionId: string;
    responseImprovement: ResponseImprovement[];
    all_analyzed: boolean;
    impact: string;
    status: string;
}
