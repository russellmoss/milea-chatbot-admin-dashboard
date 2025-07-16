import { instance } from "../base/beinstance";
import { Conversation, Contact, MessageTemplate } from "../../types/sms";
import { SmsSendRequest, SmsUpsertRequest, CreateContactRequest, CreateTemplateRequest } from "./interfaces";


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

export const createSmsContact = async (body: CreateContactRequest): Promise<Contact> => {
  const response = await instance.post("/sms/contact/create", body);
  return response.data;
}

export const getContactByUserId = async (userId: string): Promise<Contact> => {
  const response = await instance.get(`/sms/contact/userid=${userId}`);
  return response.data;
}

export const getAllContacts = async (): Promise<Contact[]> => {
  const response = await instance.get("/sms/contact/all");
  return response.data;
}

export const updateContact = async (contactId: string, body: Partial<Contact>): Promise<Contact> => {
  const response = await instance.put(`/sms/contact/update/id=${contactId}`, body);
  return response.data;
}

export const deleteContact = async (contactId: string): Promise<void> => {
  const response = await instance.delete(`/sms/contact/delete/id=${contactId}`);
  return response.data;
};

export const createTemplate = async (body: CreateTemplateRequest): Promise<MessageTemplate> => {
  const response = await instance.post("/sms/template/create", body);
  return response.data;
};

export const getAllTemplates = async (): Promise<MessageTemplate[]> => {
  const response = await instance.get("/sms/template/all");
  return response.data;
}

