import { instance } from "../base/beinstance";

export const getAvgResponseTime = async (startDate: Date, endDate: Date): Promise<number> => {
    const response = await instance.get("/metrics/average-response-time", {
        params: { startDate, endDate }
    });
    return response.data;
};

export const getQueryTypes = async (startDate: Date, endDate: Date): Promise<Record<string, number>> => {
    const response = await instance.get("/metrics/query-type-count", {
        params: { startDate, endDate }
    });
    return response.data;
};

export const getUniqueIps = async (startDate: Date, endDate: Date): Promise<string[]> => {
    const response = await instance.post("/metrics/unique-ip", { startTime: startDate, endTime: endDate });
    return response.data;
};

export const getUserCount = async (startDate: Date, endDate: Date): Promise<number> => {
    const response = await instance.post("/metrics/user-count", { startTime: startDate, endTime: endDate });
    return response.data;
}

export const getConversationCount = async (startDate: Date, endDate: Date): Promise<number> => {
    const response = await instance.post("/metrics/conversation-count", { startTime: startDate, endTime: endDate });
    return response.data;
}

export const getFailedConversations = async (startDate: Date, endDate: Date): Promise<Array<any>> => {
    const response = await instance.post("/metrics/failed-conversations", { startTime: startDate, endTime: endDate });
    return response.data;
}

export const getMsgDistribution = async (startDate: Date, endDate: Date): Promise<Record<string, number>> => {
    const response = await instance.get("/metrics/message-distribution", {
        params: { startDate, endDate }
    });
    return response.data;
}

export const getConvClubSignups = async (startDate: Date, endDate: Date): Promise<number> => {
    const response = await instance.post("/metrics/conv-clubsignup", { startTime: startDate, endTime: endDate });
    return response.data;
}
