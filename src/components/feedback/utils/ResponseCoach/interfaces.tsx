import { Message } from "../../../../apis/metrics/interfaces";


export interface Feedback {
    id: number;
    user: string;
    timestamp: string;
    messages: Message[];
    feedback: {
        rating: number;
        comment: string;
    };
    category: string;
    status: "Unread" | "Negative" | "All" | "Analyzed"
}