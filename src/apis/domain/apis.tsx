import { instance } from "../base/dashboard.instance";
import { DomainCreateRequest, Domain } from "./interfaces";

export const createDomain = async (data: DomainCreateRequest): Promise<Domain> => {
    const response = await instance.post("/domain/create", data);
    return response.data;
};

export const getAllDomains = async (): Promise<Domain[]> => {
    const response = await instance.get("/domain/all");
    return response.data;
};
