import { instance } from "../base/dashboard.instance";
import { FeedbackModel, CreateFeedbackRequest } from "./interfaces";


export const getAllFeedbacks = async (): Promise<FeedbackModel[]> => {
  const response = await instance.get('/feedback/all');
  return response.data;
};

export const createFeedback = async (body: CreateFeedbackRequest): Promise<FeedbackModel> => {
  const response = await instance.post('/feedback/create', body);
  return response.data;
};