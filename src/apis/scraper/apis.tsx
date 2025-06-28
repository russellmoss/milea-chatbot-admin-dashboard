import { instance } from "../base/scrape.instance";


export const getAllUrls = async (baseUrl: string): Promise<string[]> => {
    const response = await instance.get('/web-structure', { params: { url: baseUrl } });
    return response.data;
}