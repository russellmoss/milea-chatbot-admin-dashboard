import { instance } from "../base/beinstance";
import { LoginRequest, LoginResponse } from "./interfaces";


export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await instance.post("/auth/login", data);
    return response.data;
};