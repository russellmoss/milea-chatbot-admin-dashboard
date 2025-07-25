import { instance } from "../base/dashboard.instance";
import { SyncSetting, WebSyncSettingUpdateRequest } from "./interfaces";


export const updateWebSyncSetting = async(body: WebSyncSettingUpdateRequest): Promise<SyncSetting> => {
    const response = await instance.put("/setting/sync/web", body);
    return response.data;
};

export const getSyncSetting = async(): Promise<SyncSetting> => {
    const response = await instance.get("/setting/sync");
    return response.data;
};