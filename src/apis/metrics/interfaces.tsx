export interface Message {
    id: string;
    sessionId: string;
    sender: "user" | "bot" | "system";
    content: string;
    action: string | null;
    timestamp: Date;
    feedback: {
        feedbackGiven: boolean;
        positiveFeedback: string;
        negativeFeedback: string;
    };
    queryType: string | null;
    responseTime: number | null;
}

export interface Feedback {
    sessionId: string;
    clientIp: string;
    startTime: string;
    endTime: string;
    userId: string;
    commerce7Id: string;
    messages: Message[];
    signUpClub: boolean;
    gaveFeedback: boolean;
    feedback: {
        rating: number;
        details: string;
    };
    failure: string;
    failureReason: string | null;
}