import { instance } from "../base/instance";
import { userLoginRequest, userLoginResponse } from "./interfaces";


export const adminLogin = async (data: userLoginRequest): Promise<userLoginResponse> => {
  const response = await instance.post('/api/auth/admin-login', data);
  return response.data;
}