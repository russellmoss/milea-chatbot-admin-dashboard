export interface SmsSendRequest {
    to: string;
    message: string;
}

export interface SmsUpsertRequest {
    id: string;
    phone: string;
    message: string;
    senderRole: string;
}