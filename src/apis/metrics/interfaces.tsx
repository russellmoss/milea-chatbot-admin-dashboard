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
    queryType: "wine_info" | "club_membership" | "visiting_hours" | "reservation" | "events" | "user_profile" | "sms" | "referral" | "others" | null;
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

export interface MessageCount {
    total: number;
    user: number;
    bot: number;
}

export interface QueryTypeCounts {
    wine_info: number;
    club_membership: number;
    visiting_hours: number;
    reservation: number;
    events: number;
    user_profile: number;
    sms: number;
    referral: number;
    others: number;
}