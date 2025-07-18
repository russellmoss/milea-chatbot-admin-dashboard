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

export interface CreateCampaignRequest {
    name: string;
    recipients?: { contactId: string; listId: string; phoneNumber: string; }[];
    message: string;
    scheduledTime?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
    stats?: {
        total: number;
        sent: number;
        delivered: number;
        failed: number;
        responses: number;
    }
}