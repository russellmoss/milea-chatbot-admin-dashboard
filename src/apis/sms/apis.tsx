import { instance } from "../base/beinstance";
import { Conversation } from "../../types/sms";
import { SmsSendRequest, SmsUpsertRequest } from "./interfaces";


export const getAllSms = async (): Promise<Conversation[]> => {
  const response = await instance.get("/sms/all");
  return response.data;
};

export const sendSms = async (body: SmsSendRequest): Promise<void> => {
  const response = await instance.post("/sms/send", body);
  return response.data;
};

export const upsertSms = async (body: SmsUpsertRequest): Promise<Conversation> => {
  const response = await instance.post("/sms/upsert", body);
  return response.data;
}

export const updateSmsReadStatus = async (smsId: string, read: boolean): Promise<void> => {
  const response = await instance.put(`/sms/read/id=${smsId}/read=${read}`);
  return response.data;
};

export const updateSmsArchiveStatus = async (smsId: string, archived: boolean): Promise<void> => {
  const response = await instance.put(`/sms/archive/id=${smsId}/archive=${archived}`);
  return response.data;
}

export const updateSmsDeleteStatus = async (smsId: string, deleted: boolean): Promise<void> => {
  const response = await instance.put(`/sms/delete/id=${smsId}/delete=${deleted}`);
  return response.data;
};