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

export interface CreateContactRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    optIn: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
    lists?: string[];
    tags?: string[];
    birthdate?: string;
    notes?: string;
}

export interface CreateTemplateRequest {
    name: string;
    content: string;
    variables: string[];
    category: string;
}