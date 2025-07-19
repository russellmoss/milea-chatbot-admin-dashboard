import { instance } from "../base/dashboard.instance";
import { WebSyncCreateRequest, WebSyncUpdateRequest, WebSyncModel } from "./interfaces";


export const createWebSync = async (data: WebSyncCreateRequest): Promise<WebSyncModel> => {
  const response = await instance.post("/websync/create", data);
  return response.data;
};

export const getUrlsBasedOnBaseUrl = async (baseUrl: string): Promise<WebSyncModel[]> => {
  const response = await instance.get(`/websync/urls?baseurl=${encodeURIComponent(baseUrl)}`);
  return response.data;
}

export const updateWebSync = async (id: string, data: WebSyncUpdateRequest): Promise<WebSyncModel> => {
  const response = await instance.put(`/websync/update/${id}`, data);
  return response.data;
};
