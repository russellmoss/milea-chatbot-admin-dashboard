export interface Message {
    id: string;
    session_id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

export interface Sms {
    id: string;
    sessionId: string;
    userId: string;
    commerce7Id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    birthdate: Date | null;
    messages: Message[];
}