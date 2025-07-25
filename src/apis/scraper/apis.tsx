import { instance } from "../base/scrape.instance";


export const getAllUrls = async (baseUrl: string): Promise<string[]> => {
    const response = await instance.get('/web-structure', { params: { url: baseUrl } });
    return response.data;
};

export const startSync = async (urls: string[]): Promise<{ job_id: string }> => {
    const response = await instance.post('/start-sync', { urls });
    return response.data;
};

export const SyncStatusWebSocket = (jobId: string): WebSocket => {
    let url = instance.defaults.baseURL;
    if (url?.startsWith("http://")) {
        url = url.replace("http://", "ws://");
    } else if (url?.startsWith("https://")) {
        url = url.replace("https://", "wss://");
    }
    return new WebSocket(`${url}/ws/sync-status/${jobId}`);
};

export const cancelSync = async (jobId: string): Promise<void> => {
    await instance.post(`/cancel-sync/${jobId}`);
}
