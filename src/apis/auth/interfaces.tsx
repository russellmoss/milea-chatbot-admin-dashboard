export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  access_token: string;
  refresh_token: string;
  email: string;
  lastname: string;
  firstname: string;
  role: string;
  commerce7id: string;
  created_at: string;
  updated_at: string;
}