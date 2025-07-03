import { instance } from "../base/dashboard.instance";
import { FeedbackModel, CreateFeedbackRequest, UpdateFeedbackRequest } from "./interfaces";


export const getAllFeedbacks = async (): Promise<FeedbackModel[]> => {
  const response = await instance.get('/feedback/all');
  return response.data;
};

export const createFeedback = async (body: CreateFeedbackRequest): Promise<FeedbackModel> => {
  const response = await instance.post('/feedback/create', body);
  return response.data;
};

export const updateFeedback = async (body: UpdateFeedbackRequest): Promise<FeedbackModel> => {
  const response = await instance.put(`/feedback/update`, body);
  return response.data;
};

export const markFeedbackResolved = async (sessionId: string): Promise<FeedbackModel> => {
  const response = await instance.put('/feedback/resolved', { sessionId });
  return response.data;
};