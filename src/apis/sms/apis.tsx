import { instance } from "../base/beinstance";
import { Conversation } from "../../types/sms";

export const getAllSms = async (): Promise<Conversation[]> => {
  const response = await instance.get("/sms/all");
  return response.data;
};